import React, { useEffect, useState } from 'react';
import { DeviceHardwareType, DeviceItem } from '../../types/dashboard';
import { LightDismissDialog } from '../LightDismissDialog';
import { useDashboard } from '../../context/DashboardContext';

interface DeviceModalProps {
  open: boolean;
  roomId: string;
  initialDevice: DeviceItem | null;
  onClose: () => void;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  open,
  roomId,
  initialDevice,
  onClose,
}) => {
  const { upsertRoomDevice, deleteRoomDevice, haEntities } = useDashboard();
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<DeviceHardwareType>('humidifier');
  const [entityId, setEntityId] = useState('');
  const [valueLabel, setValueLabel] = useState('70');

  useEffect(() => {
    if (initialDevice) {
      setName(initialDevice.name);
      setModel(initialDevice.model);
      setType(initialDevice.type);
      setEntityId(initialDevice.entityId || '');
      setValueLabel(initialDevice.valueLabel || '70');
    } else {
      setName('');
      setModel('');
      setType('humidifier');
      setEntityId('');
      setValueLabel('70');
    }
  }, [initialDevice, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: DeviceItem = {
      id: initialDevice?.id || `dev-${Date.now()}`,
      name: name.trim(),
      model: model.trim() || 'Smart Home Device',
      type,
      isOn: initialDevice ? initialDevice.isOn : true,
      wifiConnected: true,
      powerActive: initialDevice ? initialDevice.powerActive : true,
      entityId: entityId.trim() || undefined,
      valueLabel: type === 'thermostat' ? valueLabel.trim() || '70' : undefined,
    };

    upsertRoomDevice(roomId, payload);
    onClose();
  };

  return (
    <LightDismissDialog
      open={open}
      title={initialDevice ? `編輯設備 • ${initialDevice.name}` : '新增智能設備 (Add Device)'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <label className="form-field">
          <span>設備名稱 (Device Name)</span>
          <input
            type="text"
            required
            placeholder="例如：Humidifier / Smart Lamp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="form-field">
          <span>型號或副標題 (Model Subtitle)</span>
          <input
            type="text"
            placeholder="例如：Xiaomi Mi - X500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>

        <div className="form-row-2">
          <label className="form-field">
            <span>硬體圖示類型 (Hardware Type)</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeviceHardwareType)}
            >
              <option value="humidifier">加濕器 (Humidifier)</option>
              <option value="speaker">智能音箱 (Speaker)</option>
              <option value="cctv">監控鏡頭 (Camera CCTV)</option>
              <option value="thermostat">溫控器 (Thermostat)</option>
              <option value="light">智能燈具 (Smart Light)</option>
              <option value="purifier">空氣清淨機 (Air Purifier)</option>
              <option value="plug">智能插座 (Smart Plug)</option>
            </select>
          </label>

          {type === 'thermostat' && (
            <label className="form-field">
              <span>顯示溫度數值</span>
              <input
                type="text"
                placeholder="70"
                value={valueLabel}
                onChange={(e) => setValueLabel(e.target.value)}
              />
            </label>
          )}
        </div>

        <label className="form-field">
          <span>Home Assistant 實體 ID (entity_id)</span>
          <input
            type="text"
            list="ha-entity-datalist"
            placeholder="例如：humidifier.xiaomi_mi_x500 或 switch.living_lamp"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
          />
          <datalist id="ha-entity-datalist">
            {haEntities.map((ent) => (
              <option key={ent.entity_id} value={ent.entity_id}>
                {ent.attributes.friendly_name || ent.entity_id}
              </option>
            ))}
          </datalist>
        </label>

        <div className="modal-actions">
          {initialDevice && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                deleteRoomDevice(roomId, initialDevice.id);
                onClose();
              }}
            >
              刪除設備
            </button>
          )}
          <div className="modal-actions-right">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              儲存並同步至 HA 配置
            </button>
          </div>
        </div>
      </form>
    </LightDismissDialog>
  );
};

