import React, { useEffect, useState } from 'react';
import {
  Link2,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  FileJson,
  FileCode2,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import {
  exportConfigToJson,
  exportToLovelaceYaml,
  importConfigFromJson,
  importFromLovelaceYaml,
} from '../../services/migrationService';

interface SettingsAndMigrationViewProps {
  defaultTab?: 'ha' | 'migration' | 'entities';
}

export const SettingsAndMigrationView: React.FC<
  SettingsAndMigrationViewProps
> = ({ defaultTab = 'ha' }) => {
  const {
    config,
    haConnected,
    haStatusMessage,
    updateConfig,
    replaceFullConfig,
    resetToDefault,
    testAndSyncHomeAssistant,
  } = useDashboard();

  const [subTab, setSubTab] = useState<'ha' | 'migration' | 'entities'>(
    defaultTab
  );
  const [baseUrl, setBaseUrl] = useState(config.haConnection.baseUrl);
  const [token, setToken] = useState(config.haConnection.accessToken);
  const [userName, setUserName] = useState(config.userName);
  const [weatherLoc, setWeatherLoc] = useState(config.weather.location);
  const [testingHa, setTestingHa] = useState(false);

  const [yamlText, setYamlText] = useState(() => exportToLovelaceYaml(config));
  const [jsonText, setJsonText] = useState(() =>
    exportConfigToJson(config, false)
  );
  const [maskTokenOnExport, setMaskTokenOnExport] = useState(false);
  const [copiedBanner, setCopiedBanner] = useState('');
  const [importFeedback, setImportFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  useEffect(() => {
    setSubTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setYamlText(exportToLovelaceYaml(config));
    setJsonText(exportConfigToJson(config, maskTokenOnExport));
  }, [config, maskTokenOnExport]);

  const handleSaveHaAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingHa(true);
    updateConfig((prev) => ({
      ...prev,
      userName: userName.trim() || 'Lemonaru',
      weather: {
        ...prev.weather,
        location: weatherLoc.trim() || 'Yogyakarta',
      },
      haConnection: {
        ...prev.haConnection,
        baseUrl: baseUrl.trim(),
        accessToken: token.trim(),
        autoConnect: Boolean(baseUrl.trim() && token.trim()),
      },
    }));

    const res = await testAndSyncHomeAssistant(baseUrl.trim(), token.trim());
    setTestingHa(false);
    setImportFeedback({
      type: res.ok ? 'ok' : 'err',
      text: res.message,
    });
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBanner(`已複製 ${label} 到剪貼簿！`);
      setTimeout(() => setCopiedBanner(''), 2500);
    } catch {
      setCopiedBanner('複製失敗，請手動全選複製。');
    }
  };

  const handleDownloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportYaml = () => {
    try {
      const next = importFromLovelaceYaml(yamlText, config);
      replaceFullConfig(next);
      setImportFeedback({
        type: 'ok',
        text: '成功從 Home Assistant Lovelace YAML 匯入並合併房間、設備與交通路線！',
      });
    } catch (err) {
      setImportFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'YAML 格式解析失敗',
      });
    }
  };

  const handleImportJson = () => {
    try {
      const next = importConfigFromJson(jsonText);
      replaceFullConfig(next);
      setImportFeedback({
        type: 'ok',
        text: '成功還原完整 JSON 看板與 Home Assistant 實體配置！',
      });
    } catch (err) {
      setImportFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'JSON 解析失敗',
      });
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    format: 'json' | 'yaml'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      try {
        if (format === 'json') {
          setJsonText(content);
          const next = importConfigFromJson(content);
          replaceFullConfig(next);
          setImportFeedback({
            type: 'ok',
            text: `已成功從檔案 ${file.name} 匯入 JSON 設定！`,
          });
        } else {
          setYamlText(content);
          const next = importFromLovelaceYaml(content, config);
          replaceFullConfig(next);
          setImportFeedback({
            type: 'ok',
            text: `已成功從檔案 ${file.name} 匯入 Lovelace YAML 設定！`,
          });
        }
      } catch (err) {
        setImportFeedback({
          type: 'err',
          text: err instanceof Error ? err.message : '檔案匯入失敗',
        });
      }
    };
    reader.readAsText(file);
  };

  const corsYamlSnippet = `# 於 Home Assistant 的 configuration.yaml 加入以下設定以允許本地看板跨域連線：
http:
  cors_allowed_origins:
    - http://localhost:5173
    - http://127.0.0.1:5173`;

  return (
    <div className="settings-page-container">
      <div className="dash-card settings-header-card">
        <div className="settings-header-left">
          <h2 className="card-title">
            Home Assistant 整合設定與配置遷移中心 (Settings & Migration)
          </h2>
          <p className="card-subtitle">
            支援 WebSocket / REST 實時連動、實體 ID (entity_id) 映射，以及雙向匯出/匯入
            Home Assistant Lovelace YAML 與完整 JSON 備份。
          </p>
        </div>

        <div className="settings-subtabs">
          <button
            type="button"
            className={`transport-tab-btn ${subTab === 'ha' ? 'active' : ''}`}
            onClick={() => setSubTab('ha')}
          >
            <Link2 size={14} />
            <span>HA 連線與個人化</span>
          </button>
          <button
            type="button"
            className={`transport-tab-btn ${
              subTab === 'migration' ? 'active' : ''
            }`}
            onClick={() => setSubTab('migration')}
          >
            <FileCode2 size={14} />
            <span>YAML / JSON 配置遷移</span>
          </button>
          <button
            type="button"
            className={`transport-tab-btn ${
              subTab === 'entities' ? 'active' : ''
            }`}
            onClick={() => setSubTab('entities')}
          >
            <ShieldCheck size={14} />
            <span>全看板實體映射表</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div className={`feedback-banner ${importFeedback.type}`}>
          <span>{importFeedback.text}</span>
          <button
            type="button"
            className="text-link-btn"
            onClick={() => setImportFeedback(null)}
          >
            關閉
          </button>
        </div>
      )}

      {copiedBanner && (
        <div className="feedback-banner ok">
          <Check size={15} />
          <span>{copiedBanner}</span>
        </div>
      )}

      {subTab === 'ha' && (
        <div className="settings-two-col">
          <section className="dash-card settings-panel">
            <h3 className="panel-title">
              1. Home Assistant 伺服器連線與個人設定
            </h3>
            <div
              className={`ha-conn-banner ${haConnected ? 'online' : 'demo'}`}
            >
              <span>狀態：{haStatusMessage}</span>
            </div>

            <form onSubmit={handleSaveHaAndTest} className="modal-form">
              <div className="form-row-2">
                <label className="form-field">
                  <span>看板顯示名稱 (Greeting Name)</span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Lemonaru"
                  />
                </label>

                <label className="form-field">
                  <span>天氣地區名稱 (Weather Location)</span>
                  <input
                    type="text"
                    value={weatherLoc}
                    onChange={(e) => setWeatherLoc(e.target.value)}
                    placeholder="Yogyakarta / Hong Kong"
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Home Assistant 網址 (Base URL)</span>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://homeassistant.local:8123"
                />
              </label>

              <label className="form-field">
                <span>
                  長期訪問權杖 (Long-Lived Access Token — 於 HA 個人檔案底部產生)
                </span>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="貼上 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </label>

              <div className="settings-btn-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={testingHa}
                >
                  <RefreshCw
                    size={15}
                    className={testingHa ? 'spin-anim' : ''}
                  />
                  <span>
                    {testingHa
                      ? '正在連線並同步實體...'
                      : '儲存設定並連線同步 Home Assistant'}
                  </span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetToDefault}
                >
                  <RotateCcw size={15} />
                  <span>重設為預設演示數據</span>
                </button>
              </div>
            </form>
          </section>

          <section className="dash-card settings-panel">
            <h3 className="panel-title">
              <Terminal size={17} />
              <span>2. Home Assistant 跨域 (CORS) 與遷移指南</span>
            </h3>
            <p className="panel-desc">
              若您的 Home Assistant 運行在區網其他主機或 Docker 容器，請將以下設定加入
              Home Assistant 的 <code>configuration.yaml</code> 並重啟 HA，即可讓本地看板直接透過
              WebSocket 與 REST API 控制所有實體：
            </p>
            <pre className="code-snippet-box">{corsYamlSnippet}</pre>
            <div className="settings-btn-row">
              <button
                type="button"
                className="btn-edit-rooms"
                onClick={() =>
                  handleCopyText(corsYamlSnippet, 'configuration.yaml CORS 設定')
                }
              >
                <Copy size={14} />
                <span>複製 configuration.yaml 片段</span>
              </button>
              <button
                type="button"
                className="btn-add-device"
                onClick={() => setSubTab('migration')}
              >
                <FileCode2 size={14} />
                <span>前往 Lovelace YAML / JSON 雙向遷移</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {subTab === 'migration' && (
        <div className="settings-two-col">
          {/* Left: Home Assistant Lovelace YAML Export / Import */}
          <section className="dash-card settings-panel">
            <div className="panel-head-split">
              <div>
                <h3 className="panel-title">
                  <FileCode2 size={18} />
                  <span>Home Assistant Lovelace YAML 雙向遷移</span>
                </h3>
                <p className="panel-desc">
                  可直接複製貼上至 Home Assistant「編輯儀表板 → 原始設定編輯器 (Raw
                  Configuration Editor)」，或將 HA 的 YAML 貼在此處匯入至本看板。
                </p>
              </div>
            </div>

            <textarea
              className="migration-textarea"
              value={yamlText}
              onChange={(e) => setYamlText(e.target.value)}
              spellCheck={false}
              aria-label="Home Assistant Lovelace YAML"
            />

            <div className="settings-btn-row wrap">
              <button
                type="button"
                className="btn-primary"
                onClick={handleImportYaml}
              >
                <Upload size={14} />
                <span>從上方 YAML 套用至看板</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopyText(yamlText, 'Lovelace YAML')}
              >
                <Copy size={14} />
                <span>複製 YAML</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  handleDownloadFile(
                    yamlText,
                    'home-assistant-lovelace-dashboard.yaml',
                    'text/yaml'
                  )
                }
              >
                <Download size={14} />
                <span>下載 .yaml 檔</span>
              </button>

              <label className="btn-secondary file-upload-label">
                <Upload size={14} />
                <span>上傳 .yaml 檔</span>
                <input
                  type="file"
                  accept=".yaml,.yml"
                  hidden
                  onChange={(e) => handleFileUpload(e, 'yaml')}
                />
              </label>
            </div>
          </section>

          {/* Right: Full JSON Snapshot Export / Import */}
          <section className="dash-card settings-panel">
            <div className="panel-head-split">
              <div>
                <h3 className="panel-title">
                  <FileJson size={18} />
                  <span>完整看板 JSON 備份與跨機遷移</span>
                </h3>
                <p className="panel-desc">
                  包含所有房間、設備狀態、Home Assistant 實體 ID 綁定、以及巴士/小巴/渡輪/港鐵常用路線設定。
                </p>
              </div>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={maskTokenOnExport}
                  onChange={(e) => setMaskTokenOnExport(e.target.checked)}
                />
                <span>隱藏 HA Token</span>
              </label>
            </div>

            <textarea
              className="migration-textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              aria-label="Dashboard JSON Configuration"
            />

            <div className="settings-btn-row wrap">
              <button
                type="button"
                className="btn-primary"
                onClick={handleImportJson}
              >
                <Upload size={14} />
                <span>從上方 JSON 還原看板</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopyText(jsonText, 'JSON 完整備份')}
              >
                <Copy size={14} />
                <span>複製 JSON</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  handleDownloadFile(
                    jsonText,
                    'smart-home-dashboard-backup.json',
                    'application/json'
                  )
                }
              >
                <Download size={14} />
                <span>下載 .json 備份</span>
              </button>

              <label className="btn-secondary file-upload-label">
                <Upload size={14} />
                <span>匯入 .json 檔案</span>
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={(e) => handleFileUpload(e, 'json')}
                />
              </label>
            </div>
          </section>
        </div>
      )}

      {subTab === 'entities' && (
        <section className="dash-card settings-panel">
          <h3 className="panel-title">
            全看板 Home Assistant 實體 ID (entity_id) 映射總表
          </h3>
          <p className="panel-desc">
            您可直接在此檢視或修改看板各模組對應的 Home Assistant{' '}
            <code>entity_id</code>，修改後會即時同步至本地儲存及 Lovelace YAML 匯出設定中。
          </p>

          <div className="entity-table-wrap">
            <table className="entity-mapping-table">
              <thead>
                <tr>
                  <th>所屬區域 / 分頁</th>
                  <th>卡片 / 設備名稱</th>
                  <th>類型</th>
                  <th>綁定之 Home Assistant entity_id</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>主看板 (Main)</td>
                  <td>主攝影機 ({config.primaryCamera.roomName})</td>
                  <td>camera</td>
                  <td>
                    <input
                      type="text"
                      className="table-entity-input"
                      value={config.primaryCamera.entityId || ''}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          primaryCamera: {
                            ...prev.primaryCamera,
                            entityId: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>主看板 (Main)</td>
                  <td>冷氣溫控 ({config.airConditioner.roomName})</td>
                  <td>climate</td>
                  <td>
                    <input
                      type="text"
                      className="table-entity-input"
                      value={config.airConditioner.entityId || ''}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          airConditioner: {
                            ...prev.airConditioner,
                            entityId: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>主看板 (Main)</td>
                  <td>音樂播放器 ({config.mediaPlayer.title})</td>
                  <td>media_player</td>
                  <td>
                    <input
                      type="text"
                      className="table-entity-input"
                      value={config.mediaPlayer.entityId || ''}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          mediaPlayer: {
                            ...prev.mediaPlayer,
                            entityId: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>
                </tr>
                {config.rooms.flatMap((room) =>
                  room.devices.map((dev) => (
                    <tr key={`${room.id}-${dev.id}`}>
                      <td>房間 • {room.name}</td>
                      <td>
                        {dev.name} ({dev.model})
                      </td>
                      <td>{dev.type}</td>
                      <td>
                        <input
                          type="text"
                          className="table-entity-input"
                          value={dev.entityId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig((prev) => ({
                              ...prev,
                              rooms: prev.rooms.map((r) =>
                                r.id === room.id
                                  ? {
                                      ...r,
                                      devices: r.devices.map((d) =>
                                        d.id === dev.id
                                          ? { ...d, entityId: val }
                                          : d
                                      ),
                                    }
                                  : r
                              ),
                            }));
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
                {config.transportRoutes.map((tr) => (
                  <tr key={tr.id}>
                    <td>交通 • {tr.operator}</td>
                    <td>
                      {tr.routeCode} 往 {tr.destination}
                    </td>
                    <td>sensor ({tr.mode})</td>
                    <td>
                      <input
                        type="text"
                        className="table-entity-input"
                        value={tr.entityId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateConfig((prev) => ({
                            ...prev,
                            transportRoutes: prev.transportRoutes.map((item) =>
                              item.id === tr.id
                                ? { ...item, entityId: val }
                                : item
                            ),
                          }));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

