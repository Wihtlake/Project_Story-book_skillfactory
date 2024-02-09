import banner1 from '../img/banner.png';
import banner2 from '../img/banner2.png';
import banner3 from '../img/banner3.png';
document.addEventListener("DOMContentLoaded", function() {
     const titles = document.querySelectorAll('.slider__title');
     const content = document.querySelector('.slider__content');
     const indicators = document.querySelectorAll('.slider__indicator');
   
     const slides = [
        {
            content: { imageSrc: banner1}
        },
        {
            content: { imageSrc: banner2}
        },
        {
            content: {imageSrc: banner3}
        }
    ];
    
   
     let currentIndex = 0;
     
    //  let i = 0;
    //     while (i < 3) { // выводит 0, затем 1, затем 2
    //     setTimeout(() => {
    //         alert( i );
    //       currentIndex++;
    //       i++;
    //       console.log('currentIndex: ', currentIndex);
    //  }, 500);
        
    // }
     
   
     function showSlide(index) {
         const slide = slides[index];
   
         titles.forEach((title, i) => {
             title.classList.toggle('slider__title-active', i === index);
         });
   
         content.innerHTML = `
             <div class="slider__image"><img src="${slide.content.imageSrc}" alt=""></div>
         `;
         
         indicators.forEach((indicator, i) => {
           indicator.classList.toggle('slider__indicator--active', i === index);
           indicator.addEventListener('click', () => showSlide(i)); // Добавляем обработчик события для индикатора
         });
     }
     function showNextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }
     titles.forEach((title, index) => {
         title.addEventListener('click', () => showSlide(index));
     });

     
     // Initial display of the first slide
     showSlide(currentIndex);
     setInterval(showNextSlide, 5000);
   });
   