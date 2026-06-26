import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "你的 apiKey",
  authDomain: "jsnap25.firebaseapp.com",
  projectId: "jsnap25",
  storageBucket: "jsnap25.firebasestorage.app",
  messagingSenderId: "你的 messagingSenderId",
  appId: "你的 appId"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const quantityInput = document.getElementById('quantity');
const minusBtn = document.getElementById('minus');
const plusBtn = document.getElementById('plus');
const calcBtn = document.getElementById('calcBtn');
const productTotalEl = document.getElementById('productTotal');
const shippingFeeEl = document.getElementById('shippingFee');
const grandTotalEl = document.getElementById('grandTotal');
const orderForm = document.getElementById('orderForm');
const pricePerBox = 500;

function money(n){ return 'NT$' + n.toLocaleString('zh-TW'); }

function getShipping(){
  const checked = document.querySelector('input[name="shipping"]:checked');
  return Number(checked ? checked.value : 0);
}

function updateTotal(){
  const qty = Math.max(1, Number(quantityInput.value || 1));
  quantityInput.value = qty;

  const productTotal = qty * pricePerBox;
  const shipping = getShipping();
  const grandTotal = productTotal + shipping;

  productTotalEl.textContent = money(productTotal);
  shippingFeeEl.textContent = money(shipping);
  grandTotalEl.textContent = money(grandTotal);

  return { qty, productTotal, shipping, grandTotal };
}

minusBtn.addEventListener('click',()=>{quantityInput.value=Math.max(1,Number(quantityInput.value)-1);updateTotal();});
plusBtn.addEventListener('click',()=>{quantityInput.value=Number(quantityInput.value||1)+1;updateTotal();});
quantityInput.addEventListener('input', updateTotal);
document.querySelectorAll('input[name="shipping"]').forEach(r=>r.addEventListener('change', updateTotal));
calcBtn.addEventListener('click', updateTotal);
updateTotal();

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const proof = document.getElementById('proof').files[0];
  const flavor = document.querySelector('input[name="flavor"]:checked').value;
  const shippingText = document.querySelector('input[name="shipping"]:checked').parentElement.textContent.trim();
  const total = updateTotal();

  if (!name || !phone || !address) {
    alert('請填寫姓名、手機、取貨 / 收件資料');
    return;
  }

  if (!proof) {
    alert('請上傳購買證明');
    return;
  }

  const orderId = 'JSNAP' + Date.now();
  const fileName = `${orderId}_${proof.name}`;
  const fileRef = ref(storage, `paymentProofs/${fileName}`);

  try {
    await uploadBytes(fileRef, proof);

    await addDoc(collection(db, 'orders'), {
      orderId,
      name,
      phone,
      address,
      flavor,
      quantity: total.qty,
      productTotal: total.productTotal,
      shippingFee: total.shipping,
      grandTotal: total.grandTotal,
      shippingMethod: shippingText,
      proofPath: `paymentProofs/${fileName}`,
      createdAt: serverTimestamp()
    });

    alert('訂單已送出！謝謝你的訂購。');
    orderForm.reset();
    quantityInput.value = 1;
    updateTotal();

  } catch (error) {
    console.error(error);
    alert('送出失敗，請稍後再試，或聯絡店家。');
  }
});
