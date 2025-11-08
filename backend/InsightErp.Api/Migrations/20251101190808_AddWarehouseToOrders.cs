using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InsightErp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWarehouseToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_WarehouseId_Date",
                table: "Orders",
                columns: new[] { "WarehouseId", "Date" });

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Warehouses_WarehouseId",
                table: "Orders",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Warehouses_WarehouseId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_WarehouseId_Date",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Orders");
        }
    }
}
