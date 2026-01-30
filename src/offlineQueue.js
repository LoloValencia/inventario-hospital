import { get, set, del } from "idb-keyval";

const KEY = "offline_queue_v1";

/** Devuelve la cola (array) */
export async function readQueue() {
  return (await get(KEY)) || [];
}

/** Guarda la cola completa */
async function writeQueue(queue) {
  await set(KEY, queue);
}

/** Agrega un item a la cola */
export async function enqueue(item) {
  const q = await readQueue();
  q.push(item);
  await writeQueue(q);
  return q.length;
}

/** Quita el primer item (FIFO) */
export async function dequeue() {
  const q = await readQueue();
  const item = q.shift();
  await writeQueue(q);
  return item;
}

/** Quita un item por id */
export async function removeById(id) {
  const q = await readQueue();
  const nq = q.filter((x) => x.id !== id);
  await writeQueue(nq);
  return nq.length;
}

/** Vacía la cola */
export async function clearQueue() {
  await del(KEY);
}