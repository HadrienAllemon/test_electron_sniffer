// import { TableNode } from "@table-library/react-table-library";
// import dummyData from "./dummyData"
// import { useSort } from "@table-library/react-table-library/sort";
// // import { Column, CompactTable } from '@table-library/react-table-library/compact';
// import { Column, CompactTable } from '@table-library/react-table-library';
// const testData = [
//     {
//         id: '0',
//         name: 'Shopping List',
//         deadline: new Date(2020, 1, 15),
//         type: 'TASK',
//         isComplete: true,
//         nodes: 3,
//     },
// ];



// export const ItemTable = () => {
//     const COLUMNS :any = [
//         { label: 'picture', renderCell: (item:any) => "HELLO", cellProps:{innerWidth:"50px", maxWidth:"25px" }, maxWidth:"25px" },
//         { label: 'Nom', renderCell: (item:any) => item.fr, sort: { sortKey: "Nom" }, cellProps:{innerWidth:"50px"} },
//         { label: 'Profit', renderCell: (item:any) => item.price, sort: { sortKey: "Profit" }, cellProps:{innerWidth:"50px"} },
//         { label: 'Quantité vendue', renderCell: (item:any) => item.amountBought, sort: { sortKey: "Quantite" }, cellProps:{innerWidth:"50px"}},
//     ];
//     function onSortChange(action:any, state:any) {
//         console.log(action, state);
//       }
//     const sort = useSort(
//         {nodes:dummyData},
//         {
//           onChange: onSortChange,
//         },
//         {
//           sortFns: {
//             Nom: (array) => array.sort((a, b) => a.fr.localeCompare(b.fr)),
//             Profit: (array) => array.sort((a, b) => a.price - b.price),
//             Quantite: (array) => array.sort((a, b) => a.amountBought - b.amountBought),
//           },
//         }
//       );
//     return <CompactTable columns={COLUMNS} data={{ nodes:dummyData }} sort={sort} />;
// }
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component

import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';
import { useState } from 'react';
import dummyData from './dummyData';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export const ItemTable = () => {
  // Row Data: The data to be displayed.
  // const [rowData, setRowData] = useState([
  //   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  //   { make: "Ford", model: "F-Series", price: 33850, electric: false },
  //   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  // ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef<any>[]>([
    { field: "", headerName:"", flex:1, cellRenderer:(item:any)=><div style={{backgroundImage:`url(${item.data.id})`}} /> },
    { field: "fr", headerName:"Nom", flex:3 },
    { field: "price" , headerName:"Prix", flex:3},
    { field: "amountBought" , headerName:"Nombre Vendu", flex:3},
  ]);

  return (
    <div
      // define a height because the Data Grid will fill the size of the parent container
      style={{ height: '100%' }}
    >
      <AgGridReact
        rowData={dummyData}
        columnDefs={colDefs}
        animateRows={false}
      />
    </div>
  )
}