/* ==========================================================================
   IDB-ARQUIVOS.JS — guarda o CONTEÚDO BINÁRIO dos arquivos do Drive.

   Por que não usar localStorage aqui: localStorage tem limite de poucos MB
   e só guarda texto (obrigaria converter todo arquivo para base64, inflando
   ~33% o tamanho e estourando o limite rapidamente). O IndexedDB roda no
   mesmo navegador, sem servidor, mas aceita Blobs de verdade e tem um limite
   muito maior — por isso ele guarda o arquivo em si, enquanto o db.js
   (localStorage) guarda só os METADADOS (nome, cliente, projeto, tags).

   Carregar depois de db.js, só nas páginas que mexem com arquivos (Drive).
   ========================================================================== */

const IDB_NOME = "ctf_arquivos_db";
const IDB_STORE = "blobs";

function abrirBancoArquivos() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(IDB_NOME, 1);
    pedido.onupgradeneeded = () => {
      pedido.result.createObjectStore(IDB_STORE);
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function salvarBlobArquivo(id, blob) {
  const db = await abrirBancoArquivos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(blob, id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function obterBlobArquivo(id) {
  const db = await abrirBancoArquivos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const pedido = tx.objectStore(IDB_STORE).get(id);
    pedido.onsuccess = () => resolve(pedido.result || null);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function excluirBlobArquivo(id) {
  const db = await abrirBancoArquivos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
