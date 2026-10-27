import test from 'node:test';
import assert from 'node:assert/strict';
import { cooldownMs, remainingSeconds, retryDelay } from '../lib/guestbook-cooldown.ts';
import { dragDirection, carouselTarget } from '../lib/string-carousel.ts';

test('작성 후 경과 시간만큼 대기 시간이 줄고 만료 후 0이 됨', () => {
  assert.equal(cooldownMs(1000, 1000), 10000);
  assert.equal(cooldownMs(1000, 5500), 5500);
  assert.equal(cooldownMs(1000, 12000), 0);
  assert.equal(cooldownMs(50000, 1000), 10000);
});
test('타이머는 정지된 탭에서 돌아와도 현재 시각으로 계산', () => {
  assert.equal(remainingSeconds(10000, 999), 10);
  assert.equal(remainingSeconds(10000, 9999), 1);
  assert.equal(remainingSeconds(10000, 10000), 0);
  assert.equal(remainingSeconds(10000, 20000), 0);
});
test('서버의 남은 시간과 Retry-After를 읽고 잘못된 응답은 제한 범위로 처리', () => {
  assert.equal(retryDelay(3200, '10'), 3200);
  assert.equal(retryDelay(undefined, '4'), 4000);
  assert.equal(retryDelay(undefined, null), 10000);
  assert.equal(retryDelay(Infinity, 'invalid'), 10000);
  assert.equal(retryDelay(-10, null), 0);
  assert.equal(retryDelay(1000000, null), 10000);
});
test('단순 클릭은 이동하지 않고 좌우 드래그·짧고 빠른 움직임을 구분', () => {
  assert.equal(dragDirection(4, 100, 448), 0);
  assert.equal(dragDirection(-80, 500, 448), 1);
  assert.equal(dragDirection(80, 500, 448), -1);
  assert.equal(dragDirection(-30, 40, 448), 1);
  assert.equal(dragDirection(-21, 1, 448), 0);
});
test('첫 실의 이전과 마지막 실의 다음으로 넘어가지 않음', () => {
  assert.equal(carouselTarget(0, -1, true), 0);
  assert.equal(carouselTarget(4, 1, false), 4);
  assert.equal(carouselTarget(4, 1, true), 5);
  assert.equal(carouselTarget(4, -1, true), 3);
});
