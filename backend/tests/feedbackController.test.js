import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedback, updateFeedback } from '../controllers/feedbackController.js';
import Feedback from '../models/Feedback.js';

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test('rejects invalid ratings and comments before creating a review', async () => {
  for (const rating of [1.5, '4.9', '5stars', true, [5], null, 0, 6]) {
    const res = response();
    let error;
    await createFeedback({ body: { eventId: 'event', rating, comment: 'Great event' } }, res, (value) => { error = value; });
    assert.equal(res.statusCode, 400);
    assert.match(error.message, /whole number/);
  }
  for (const comment of [123, {}, [], null, '   ', 'a'.repeat(801)]) {
    const res = response();
    let error;
    await createFeedback({ body: { eventId: 'event', rating: 5, comment } }, res, (value) => { error = value; });
    assert.equal(res.statusCode, 400);
    assert.match(error.message, /comment/);
  }
});

test('invalid updates do not save and lookup stays scoped to the reviewer', async (t) => {
  let saved = false;
  t.mock.method(Feedback, 'findOne', async (query) => {
    assert.deepEqual(query, { _id: 'review', user: 'owner' });
    return { save: async () => { saved = true; } };
  });
  const res = response();
  let error;
  await updateFeedback({ params: { id: 'review' }, user: { _id: 'owner' }, body: { rating: '3.5', comment: 'Updated' } }, res, (value) => { error = value; });
  assert.equal(res.statusCode, 400);
  assert.match(error.message, /whole number/);
  assert.equal(saved, false);
});
