// document.getElementsByClassName("thumbnails").addEventListener("click", openView, false)
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);


console.log(document.getElementsByClassName("thumbnails"));

const frames = Array.from(document.getElementsByClassName("thumbnails"));

frames.forEach(element => {

  element.addEventListener("click", openView, false)
  
});

// document.getElementsByClassName("button1")[0].addEventListener("click", highlight, false)

Array.from(document.getElementsByClassName("button")).forEach(e => e.addEventListener("click", highlight, false))





// $(window).click(function() {

//   Array.from(document.getElementsByClassName("displayImages")).forEach(function (e) {
//     e.style.display = 'none';
// });
// })

// $('thumbnails').click(function(event){
//   event.stopPropagation();
// });



//document.querySelector("thumbnails").addEventListener("click", openView, false)
 //document.getElementById("Gaslink").addEventListener("click", openView, false)
// document.getElementById("03").addEventListener("click", openView, false)
// document.getElementById("04").addEventListener("click", openView, false)
// document.getElementById("05").addEventListener("click", openView, false)
// document.getElementById("06").addEventListener("click", openView, false)
// document.getElementById("07").addEventListener("click", openView, false)

function openView (parameter) {

    var viewID = parameter.target.id
    console.log(parameter.target.id);

    switch (viewID) {

      case "Gaslink": 
            var image = document.getElementById("GaslinkLink");
            image.style.display = 'flex';
                
        break;
  
      case "Flatten": 
            var image = document.getElementById("GaslinkLink");
            image.style.display = 'flex';

      break;
  
      case "Paradise":    
            var image = document.getElementById("ParadiseLink");
            image.style.display = 'flex';          
  
      break;
  
      case "04":

      break;
  
      case "05":

      break;
  
      case "06":

      break;
  
      case "07":

      break;
    
      default:  
        break;
    }
  }

    //escape image
    document.body.addEventListener( 'keydown', function (e) { 
      if (e.key == "Escape") {
        Array.from(document.getElementsByClassName("displayImages")).forEach(function (e) {
          e.style.display = 'none';
        })
      }
    } );


function unhighlightAll() {
  $('.highlightDatavis').css("background-color" , "white");
  $('.highlightDesign').css("background-color" , "white");
  $('.highlightModelmaking').css("background-color" , "white");
  $('.highlightAnimation').css("background-color" , "white");
  $('.highlightExhibit').css("background-color" , "white");
  $('.highlightDoc').css("background-color" , "white");
}

function highlight(e) {
  const key = e.target.id;
  console.log(e.target);
  unhighlightAll();
  switch (key) {
    case 'datavis':
      $('.highlightDatavis').css("background-color" , "#00ec37");
      break;

    case 'designstudio':
      $('.highlightDesign').css("background-color" , "#ff00bb");
      break;

    case 'modelmaking':
      $('.highlightModelmaking').css("background-color" , "#bfff00");
      break;
  
    case 'animation':
      $('.highlightAnimation').css("background-color" , "#00e1ff");
      break;

    case 'exhibit':
      $('.highlightExhibit').css("background-color" , "#ff6a00");
      break;
    
    case 'doc':
      $('.highlightDoc').css("background-color" , "#d000ff");
      break;

    default:
      break;
  }
}
