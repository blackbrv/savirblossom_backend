<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PaginatedResourceCollection extends ResourceCollection
{
    // public $collects = 'array';

    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->values()->all(),
            'links' => [
                'first' => $this->resource->url(1),
                'last' => $this->resource->lastPage() > 0 ? $this->resource->url($this->resource->lastPage()) : null,
                'prev' => $this->resource->previousPageUrl(),
                'next' => $this->resource->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $this->resource->currentPage(),
                'from' => $this->resource->firstItem(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'to' => $this->resource->lastItem(),
                'total' => $this->resource->total(),
            ],
        ];
    }
}
