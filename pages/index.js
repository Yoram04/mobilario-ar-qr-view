import React, { useState, useRef } from 'react';
import { Upload, QrCode, Trash2, Download } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [models, setModels] = useState([
    { id: 1, name: 'Paso Gato', w: 3.0, h: 1.2, d: 1.1, qr: 'QR001', glbFile: null, glbUrl: null },
  ]);
  const [newModel, setNewModel] = useState({ name: '', w: 2.0, h: 1.5, d: 0.8, glbFile: null });
  const [selectedModel, setSelectedModel] = useState(models[0]);

  const addModel = () => {
    if (!newModel.name.trim() || !newModel.glbFile) return;
    const id = Math.max(...models.map(m => m.id), 0) + 1;
    const glbUrl = URL.createObjectURL(newModel.glbFile);
    const model = { id, name: newModel.name, w: newModel.w, h: newModel.h, d: newModel.d, qr: `QR${String(id).padStart(3, '0')}`, glbFile: newModel.glbFile, glbUrl };
    setModels([...models, model]);
    setSelectedModel(model);
    setNewModel({ name: '', w: 2.0, h: 1.5, d: 0.8, glbFile: null });
  };

  const deleteModel = (id) => {
    const updated = models.filter(m => m.id !== id);
    setModels(updated);
    if (selectedModel?.id === id) setSelectedModel(updated[0]);
  };

  const handleGLBUpload = (id, file) => {
    if (file?.name.endsWith('.glb')) {
      const glbUrl = URL.createObjectURL(file);
      setModels(models.map(m => m.id === id ? { ...m, glbFile: file, glbUrl } : m));
    }
  };

  const downloadQR = (model) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.href)}?model=${model.id}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${model.name}.png`;
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', fontFamily: 'system-ui' }}>
      <div style={{ background: 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)', borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)', padding: '28px 24px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', background: 'linear-gradient(135deg, #0099cc 0%, #0066aa 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '22px', color: 'white', boxShadow: '0 8px 24px rgba(0, 102, 170, 0.2)' }}>MMC</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 6px 0', color: '#1a1a1a' }}>MOBILARIO AR</h1>
        <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>QR VIEW by MMC</p>
      </div>

      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', padding: '0 24px' }}>
        {[{ id: 'catalog', label: '📱 Catálogo' }, { id: 'admin', label: '⚙️ Administrador' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 24px', border: 'none', background: activeTab === tab.id ? 'rgba(0, 102, 170, 0.05)' : 'transparent', color: activeTab === tab.id ? '#0066aa' : '#999999', cursor: 'pointer', fontSize: '14px', fontWeight: '600', borderBottom: activeTab === tab.id ? '2px solid #0066aa' : 'none', transition: 'all 0.3s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'catalog' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', color: '#1a1a1a' }}>Catálogo de Modelos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {models.map(model => (
                <div key={model.id} onClick={() => setSelectedModel(model)} style={{ background: '#ffffff', border: selectedModel?.id === model.id ? '2px solid #0066aa' : '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '16px', padding: '20px', cursor: 'pointer', boxShadow: selectedModel?.id === model.id ? '0 8px 24px rgba(0, 102, 170, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#1a1a1a' }}>{model.name}</h3>
                  <p style={{ fontSize: '13px', color: '#666666', margin: '0 0 14px 0' }}>{model.w}m × {model.h}m × {model.d}m</p>
                  <div style={{ fontSize: '12px', background: '#f0f4ff', padding: '8px 12px', borderRadius: '8px', color: '#0066aa', marginBottom: '14px', textAlign: 'center', fontWeight: '600' }}>{model.qr} {model.glbUrl ? '✓' : '⚠'}</div>
                  <button style={{ width: '100%', padding: '10px', background: model.glbUrl ? 'rgba(0, 102, 170, 0.1)' : 'rgba(0, 0, 0, 0.03)', color: model.glbUrl ? '#0066aa' : '#cccccc', border: '1px solid ' + (model.glbUrl ? 'rgba(0, 102, 170, 0.2)' : 'rgba(0, 0, 0, 0.08)'), borderRadius: '8px', fontSize: '12px', cursor: model.glbUrl ? 'pointer' : 'not-allowed', fontWeight: '600' }} disabled={!model.glbUrl}>👁️ Ver en AR</button>
                </div>
              ))}
            </div>

            {selectedModel && (
              <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '28px', color: '#1a1a1a' }}>{selectedModel.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 102, 170, 0.15)' }}>
                    <p style={{ fontSize: '11px', color: '#666666', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Ancho (W)</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#0066aa' }}>{selectedModel.w}m</p>
                  </div>
                  <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 102, 170, 0.15)' }}>
                    <p style={{ fontSize: '11px', color: '#666666', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Alto (H)</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#0066aa' }}>{selectedModel.h}m</p>
                  </div>
                  <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 102, 170, 0.15)' }}>
                    <p style={{ fontSize: '11px', color: '#666666', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Profundidad (D)</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#0066aa' }}>{selectedModel.d}m</p>
                  </div>
                </div>
                <button onClick={() => downloadQR(selectedModel)} disabled={!selectedModel.glbUrl} style={{ width: '100%', padding: '14px', background: selectedModel.glbUrl ? 'linear-gradient(135deg, #0099cc 0%, #0066aa 100%)' : '#cccccc', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: selectedModel.glbUrl ? 'pointer' : 'not-allowed' }}>
                  <QrCode size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Descargar QR
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', color: '#1a1a1a' }}>Panel de Administración</h2>
            <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '20px', padding: '36px', marginBottom: '36px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#1a1a1a' }}>Agregar Nuevo Modelo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <input type="text" placeholder="Nombre" value={newModel.name} onChange={(e) => setNewModel({ ...newModel, name: e.target.value })} style={{ padding: '12px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '10px', fontSize: '14px', background: '#f8f8f8' }} />
                <input type="number" placeholder="Ancho (m)" step="0.1" value={newModel.w} onChange={(e) => setNewModel({ ...newModel, w: parseFloat(e.target.value) })} style={{ padding: '12px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '10px', fontSize: '14px', background: '#f8f8f8' }} />
                <input type="number" placeholder="Alto (m)" step="0.1" value={newModel.h} onChange={(e) => setNewModel({ ...newModel, h: parseFloat(e.target.value) })} style={{ padding: '12px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '10px', fontSize: '14px', background: '#f8f8f8' }} />
                <input type="number" placeholder="Profundidad (m)" step="0.1" value={newModel.d} onChange={(e) => setNewModel({ ...newModel, d: parseFloat(e.target.value) })} style={{ padding: '12px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '10px', fontSize: '14px', background: '#f8f8f8' }} />
              </div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>Archivo GLB</label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '28px', border: '2px dashed rgba(0, 102, 170, 0.3)', borderRadius: '12px', cursor: 'pointer', background: newModel.glbFile ? '#f0f4ff' : '#f8f8f8', color: newModel.glbFile ? '#0066aa' : '#666666', marginBottom: '20px' }}>
                <Upload size={22} />
                <span>{newModel.glbFile ? newModel.glbFile.name : 'Selecciona GLB'}</span>
                <input type="file" accept=".glb" onChange={(e) => setNewModel({ ...newModel, glbFile: e.target.files?.[0] })} style={{ display: 'none' }} />
              </label>
              <button onClick={addModel} disabled={!newModel.glbFile || !newModel.name} style={{ width: '100%', padding: '14px', background: newModel.glbFile && newModel.name ? 'linear-gradient(135deg, #0099cc 0%, #0066aa 100%)' : '#cccccc', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: newModel.glbFile && newModel.name ? 'pointer' : 'not-allowed' }}>➕ Agregar</button>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1a1a1a' }}>Modelos</h3>
            {models.map(model => (
              <div key={model.id} style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#1a1a1a' }}>{model.name}</h4>
                  <p style={{ fontSize: '13px', color: '#666666', margin: '4px 0 0 0' }}>{model.w}m × {model.h}m × {model.d}m</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!model.glbUrl && (
                    <label style={{ padding: '8px 12px', background: 'rgba(0, 102, 170, 0.1)', color: '#0066aa', border: '1px solid rgba(0, 102, 170, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
                      <Upload size={14} />
                      <input type="file" accept=".glb" onChange={(e) => handleGLBUpload(model.id, e.target.files?.[0])} style={{ display: 'none' }} />
                    </label>
                  )}
                  <button onClick={() => downloadQR(model)} disabled={!model.glbUrl} style={{ padding: '8px 12px', background: model.glbUrl ? '#f8f8f8' : '#eeeeee', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '8px', cursor: model.glbUrl ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: model.glbUrl ? '#0066aa' : '#999999', fontWeight: '600' }}>
                    <QrCode size={14} />
                  </button>
                  <button onClick={() => deleteModel(model.id)} style={{ padding: '8px 12px', background: '#ffe8e8', border: '1px solid rgba(255, 0, 0, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ff4444', fontWeight: '600' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
