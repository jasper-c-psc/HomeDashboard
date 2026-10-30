import { describe, it, expect } from 'vitest';
import { DEFAULT_DASHBOARD_CONFIG } from '../../data/defaultConfig';
import {
  exportConfigToJson,
  importConfigFromJson,
  exportToLovelaceYaml,
  importFromLovelaceYaml,
} from '../migrationService';

describe('migrationService - Home Assistant & JSON Settings Migration', () => {
  it('exports and re-imports full dashboard config via JSON losslessly', () => {
    const jsonStr = exportConfigToJson(DEFAULT_DASHBOARD_CONFIG, false);
    expect(jsonStr).toContain('"userName": "Lemonaru"');
    expect(jsonStr).toContain('"tr-bus-968"');

    const imported = importConfigFromJson(jsonStr);
    expect(imported.userName).toBe('Lemonaru');
    expect(imported.airConditioner.targetTemp).toBe(21.5);
    expect(imported.rooms.length).toBe(6);
    expect(imported.transportRoutes.some((r) => r.routeCode === '968')).toBe(true);
  });

  it('masks Home Assistant access token when maskToken is true', () => {
    const configWithSecret = {
      ...DEFAULT_DASHBOARD_CONFIG,
      haConnection: {
        ...DEFAULT_DASHBOARD_CONFIG.haConnection,
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret',
      },
    };
    const jsonMasked = exportConfigToJson(configWithSecret, true);
    const parsed = JSON.parse(jsonMasked);
    expect(parsed.haConnection.accessToken).toBe('');
  });

  it('exports valid Home Assistant Lovelace YAML including rooms, climate, and transport view', () => {
    const yamlStr = exportToLovelaceYaml(DEFAULT_DASHBOARD_CONFIG);
    expect(yamlStr).toContain('title: Lemonaru Smart Home');
    expect(yamlStr).toContain('climate.living_room_ac');
    expect(yamlStr).toContain('camera.bed_room_camera');
    expect(yamlStr).toContain('path: transport');
    expect(yamlStr).toContain('sensor.kmb_968_eta');
  });

  it('keeps demo rooms, energy, and notifications when the JSON backup is partial', () => {
    const imported = importConfigFromJson('{"userName":"Ada"}');
    expect(imported.userName).toBe('Ada');
    expect(imported.rooms.length).toBe(DEFAULT_DASHBOARD_CONFIG.rooms.length);
    expect(imported.energy.weeklyData.length).toBeGreaterThan(0);
    expect(imported.notifications.length).toBeGreaterThan(0);
    expect(imported.schedules.length).toBeGreaterThan(0);
    expect(imported.haConnection.baseUrl).toBe(
      DEFAULT_DASHBOARD_CONFIG.haConnection.baseUrl
    );
  });

  it('rejects a JSON array payload', () => {
    expect(() => importConfigFromJson('[1,2,3]')).toThrow(
      'Invalid JSON configuration payload.'
    );
  });

  it('imports Home Assistant Lovelace YAML and merges entities into DashboardConfig', () => {
    const sampleLovelaceYaml = `
title: Custom HA Home
views:
  - title: Main Room
    path: main-room
    cards:
      - type: thermostat
        entity: climate.master_ac
        name: Master Suite
      - type: entities
        title: Master Room
        entities:
          - entity: switch.smart_humidifier
            name: Master Humidifier
          - entity: light.ceiling_lamp
            name: Ceiling Lamp
  - title: Transport
    path: transport
    cards:
      - type: entities
        title: Commute ETA
        entities:
          - entity: sensor.bus_104_eta
            name: Cross Harbour 104
`;
    const merged = importFromLovelaceYaml(sampleLovelaceYaml, DEFAULT_DASHBOARD_CONFIG);
    expect(merged.airConditioner.entityId).toBe('climate.master_ac');
    expect(merged.airConditioner.roomName).toBe('Master Suite');
    const masterRoom = merged.rooms.find((r) => r.name === 'Master Room');
    expect(masterRoom).toBeDefined();
    expect(masterRoom?.devices.some((d) => d.entityId === 'switch.smart_humidifier')).toBe(true);
    expect(merged.transportRoutes.some((t) => t.entityId === 'sensor.bus_104_eta')).toBe(true);
  });
});

