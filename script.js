const quantityInput = document.getElementById('quantity');
const minusBtn = document.getElementById('minus');
const plusBtn = document.getElementById('plus');
const calcBtn = document.getElementById('calcBtn');
const productTotalEl = document.getElementById('productTotal');
const shippingFeeEl = document.getElementById('shippingFee');
const grandTotalEl = document.getElementById('grandTotal');
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
  productTotalEl.textContent = money(productTotal);
  shippingFeeEl.textContent = money(shipping);
  grandTotalEl.textContent = money(productTotal + shipping);
}
minusBtn.addEventListener('click',()=>{quantityInput.value=Math.max(1,Number(quantityInput.value)-1);updateTotal();});
plusBtn.addEventListener('click',()=>{quantityInput.value=Number(quantityInput.value||1)+1;updateTotal();});
quantityInput.addEventListener('input', updateTotal);
document.querySelectorAll('input[name="shipping"]').forEach(r=>r.addEventListener('change', updateTotal));
calcBtn.addEventListener('click', updateTotal);
updateTotal();
