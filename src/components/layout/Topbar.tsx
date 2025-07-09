import { Button } from "primereact/button";

export default function TopBar() {
  return (
    <div style={{ height: 50, background: '#f8f9fa', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ccc' }}>
      <span style={{ fontWeight: 600 }}>Naklua Builder 1.0</span>
      <div>
        <Button label="Save All" icon="pi pi-save" className="p-button-sm" />
      </div>
    </div>
  );
}
