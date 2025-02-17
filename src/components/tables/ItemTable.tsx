
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component

import { AllCommunityModule, ColDef, IRowNode, ModuleRegistry } from 'ag-grid-community';
import { useState } from 'react';


interface ItemTableProps{
  data:any[];
  colDefs:ColDef<any>[];
}
export const ItemTable:React.FC<ItemTableProps> = ({data, colDefs}) => {
  const [hidden,setHidden] = useState(true);
  return (
    <div
      style={{ height: '100%', visibility:hidden?"hidden" : "visible" }}
    >
      <AgGridReact
        rowData={data}
        columnDefs={colDefs}
        animateRows={false}
        onFirstDataRendered={()=>setHidden(false)}
      />
    </div>
  )
}