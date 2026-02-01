import test from 'node:test';
import assert from 'node:assert';
import * as MetricTileExport from './metric-tile';
import * as PlatformCardExport from './platform-card';
import * as ConfirmDialogExport from './confirm-dialog';
import * as ConnectProviderModalExport from './connect-provider-modal';
import * as LineChartWrapperExport from './line-chart-wrapper';

test('UI Components Exports', async (t) => {
  await t.test('MetricTile should be exported', () => {
    assert.ok(MetricTileExport.MetricTile);
  });

  await t.test('PlatformCard should be exported', () => {
    assert.ok(PlatformCardExport.PlatformCard);
  });

  await t.test('ConfirmDialog should be exported', () => {
    assert.ok(ConfirmDialogExport.ConfirmDialog);
  });

  await t.test('ConnectProviderModal should be exported', () => {
    assert.ok(ConnectProviderModalExport.ConnectProviderModal);
  });

  await t.test('LineChartWrapper should be exported', () => {
    assert.ok(LineChartWrapperExport.LineChartWrapper);
  });
});
