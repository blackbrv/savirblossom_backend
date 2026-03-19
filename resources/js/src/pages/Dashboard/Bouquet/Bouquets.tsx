import { Button } from "@/components/ui/button";
import { bouquetColumns } from "@/lib/columns";
import {
    GetBouquetsResponse,
    useBouquets,
} from "@/services/Bouquets/BouquetsApi";
import DataTable from "@/src/components/ui/DataTable";
import { Plus } from "lucide-react";

export default function Bouquets() {
    const { data = [] } = useBouquets({});
    return (
        <main className="h-screen mx-autoflex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Bouquets
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center">
                    <Button className="capitalize">
                        <Plus className="text-primary-foreground" />
                        Create new bouquet
                    </Button>
                </div>

                <DataTable
                    columns={bouquetColumns}
                    data={data as GetBouquetsResponse[]}
                />
            </section>
        </main>
    );
}
