
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component

import { AllCommunityModule, ColDef, IRowNode, ModuleRegistry } from 'ag-grid-community';
import { useState } from 'react';


interface ItemTableProps{
  data:any[];
  colDefs:ColDef<any>[];
}
export const ItemTable:React.FC<ItemTableProps> = ({data, colDefs}) => {
  const [hidden, setHidden] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div  style={{ padding: '6px 0' }}>
        <input
          type="text"
          placeholder="Filtrer..."
          value={quickFilter}
          onChange={e => setQuickFilter(e.target.value)}
          style={{ width: 280 }}
          className="filterInput"
        />
      </div>
      <div style={{ flex: 1, visibility: hidden ? "hidden" : "visible" }}>
        <AgGridReact
          rowData={data}
          columnDefs={colDefs}
          animateRows={false}
          quickFilterText={quickFilter}
          onFirstDataRendered={() => setHidden(false)}
        />
      </div>
    </div>
  )
}