//pass in username
document.getElementById('uname').value = document.location.pathname;

//preview design
const imgInput = document.getElementById('design-input');
const cakeTop = document.getElementById('caketop');

imgInput.addEventListener('change', () => {
    if(imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            cakeTop.data = e.target.result;
        }
        reader.readAsDataURL(imgInput.files[0]);
    } 
})