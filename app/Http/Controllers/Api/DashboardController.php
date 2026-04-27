<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaginatedResourceCollection;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalBouquetsSold = OrderItem::whereHas('order.invoice', function ($query) {
            $query->where('status', 'paid');
        })->sum('quantity');

        $totalRevenue = Order::whereHas('invoice', function ($query) {
            $query->where('status', 'paid');
        })->sum('total');

        $totalCustomers = Customer::count();

        return response()->json([
            'total_bouquets_sold' => (int) $totalBouquetsSold,
            'total_revenue' => (int) $totalRevenue,
            'total_customers' => (int) $totalCustomers,
        ]);
    }

    public function chart(Request $request): JsonResponse
    {
        $period = $request->input('period', 'monthly');

        $paidOrders = Order::with('invoice')
            ->whereHas('invoice', function ($query) {
                $query->where('status', 'paid');
            });

        $data = match ($period) {
            'daily' => $this->getDailyChartData($paidOrders),
            'weekly' => $this->getWeeklyChartData($paidOrders),
            default => $this->getMonthlyChartData($paidOrders),
        };

        return response()->json(['data' => $data]);
    }

    private function getMonthlyChartData($query)
    {
        $year = now()->year;
        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            $monthStart = now()->create($year, $month, 1)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $monthOrders = (clone $query)
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->get();

            $data[] = [
                'period' => $monthStart->format('M Y'),
                'revenue' => (int) $monthOrders->sum('total'),
                'orders' => $monthOrders->count(),
            ];
        }

        return $data;
    }

    private function getWeeklyChartData($query)
    {
        $data = [];
        $startOfWeek = now()->startOfWeek();

        for ($i = 11; $i >= 0; $i--) {
            $weekStart = $startOfWeek->copy()->subWeeks($i)->startOfDay();
            $weekEnd = $weekStart->copy()->endOfWeek()->endOfDay();

            $weekOrders = (clone $query)
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->get();

            $data[] = [
                'period' => $weekStart->format('M j').' - '.$weekEnd->format('M j'),
                'revenue' => (int) $weekOrders->sum('total'),
                'orders' => $weekOrders->count(),
            ];
        }

        return $data;
    }

    private function getDailyChartData($query)
    {
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $day = now()->subDays($i)->startOfDay();
            $dayEnd = $day->copy()->endOfDay();

            $dayOrders = (clone $query)
                ->whereBetween('created_at', [$day, $dayEnd])
                ->get();

            $data[] = [
                'period' => $day->format('M j'),
                'revenue' => (int) $dayOrders->sum('total'),
                'orders' => $dayOrders->count(),
            ];
        }

        return $data;
    }

    public function ongoingOrders(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 10), 50);
        $status = $request->input('status', 'pending');

        $query = Order::with(['items', 'customer', 'invoice'])
            ->whereHas('invoice', function ($q) {
                $q->where('status', 'paid');
            })
            ->whereNotIn('status', ['delivered', 'cancelled']);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json(new PaginatedResourceCollection($orders));
    }

    public function bouquetSales(): JsonResponse
    {
        $categorySales = OrderItem::with(['bouquet.category'])
            ->whereHas('order.invoice', function ($query) {
                $query->where('status', 'paid');
            })
            ->join('bouquets', 'order_items.bouquet_id', '=', 'bouquets.id')
            ->join('bouquet_categories', 'bouquets.category_id', '=', 'bouquet_categories.id')
            ->select(
                'bouquet_categories.id as category_id',
                'bouquet_categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_revenue')
            )
            ->groupBy('bouquet_categories.id', 'bouquet_categories.name')
            ->orderBy('total_quantity', 'desc')
            ->get();

        $result = $categorySales->map(function ($category) {
            $topProducts = OrderItem::with('bouquet')
                ->whereHas('order.invoice', function ($query) {
                    $query->where('status', 'paid');
                })
                ->join('bouquets', 'order_items.bouquet_id', '=', 'bouquets.id')
                ->where('bouquets.category_id', $category->category_id)
                ->select(
                    'bouquets.name',
                    DB::raw('SUM(order_items.quantity) as quantity')
                )
                ->groupBy('bouquets.id', 'bouquets.name')
                ->orderBy('quantity', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($item) => [
                    'name' => $item->name,
                    'quantity' => (int) $item->quantity,
                ]);

            return [
                'category_id' => $category->category_id,
                'category_name' => $category->category_name,
                'total_quantity' => (int) $category->total_quantity,
                'total_revenue' => (int) $category->total_revenue,
                'top_products' => $topProducts,
            ];
        });

        return response()->json(['data' => $result]);
    }
}
