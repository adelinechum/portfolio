// document.getElementsByClassName("thumbnails").addEventListener("click", openView, false)
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);


console.log(document.getElementsByClassName("thumbnails"));

const frames = Array.from(document.getElementsByClassName("thumbnails"));

frames.forEach(element => {

  element.addEventListener("click", openView, false)
  
});

Array.from(document.getElementsByClassName("button")).forEach(e => e.addEventListener("click", highlight, false))

function openView (parameter) {

    var viewID = parameter.target.id
    console.log(parameter.target.id);

    switch (viewID) {

      case "Gaslink": 
            var image = document.getElementById("GaslinkLink");
            image.style.display = 'flex';
                
        break;
  
      case "Flatten": 
            var image = document.getElementById("FlattenLink");
            image.style.display = 'flex';

      break;
  
      case "Paradise":    
            var image = document.getElementById("ParadiseLink");
            image.style.display = 'flex';          
  
      break;
  
      case "SafeSpace":
        var image = document.getElementById("SafeSpaceLink");
        image.style.display = 'flex';    

      break;
  
      case "Housing":
        var image = document.getElementById("HousingLink");
        image.style.display = 'flex';    

      break;

      case "Furniture":
        var image = document.getElementById("FurnitureLink");
        image.style.display = 'flex';    

      break;
  
      case "Care":
        var image = document.getElementById("CareLink");
        image.style.display = 'flex';    

      break;

      case "Quilted":
        var image = document.getElementById("QuiltedLink");
        image.style.display = 'flex';    

      break;

      case "Pillow":
        var image = document.getElementById("PillowLink");
        image.style.display = 'flex';    

      break;

      case "SteroidPlants":
        var image = document.getElementById("SteroidPlantsLink");
        image.style.display = 'flex';    

      break;

      case "MoMa":
        var image = document.getElementById("MoMaLink");
        image.style.display = 'flex';    

      break;

      case "Refactoring":
        var image = document.getElementById("RefactoringLink");
        image.style.display = 'flex';    

      break;

      case "Desert":
        var image = document.getElementById("DesertLink");
        image.style.display = 'flex';    

      break;

      case "Wetlands":
        var image = document.getElementById("WetlandsLink");
        image.style.display = 'flex';    

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
  $('.highlightDatavis').css("border-color" , "white");
  $('.highlightDesign').css("border-color" , "white");
  $('.highlightModelmaking').css("border-color" , "white");
  $('.highlightAnimation').css("border-color" , "white");
  $('.highlightExhibit').css("border-color" , "white");
  // $('.highlightDoc').css("background-color" , "white");
}


function highlight(e) {
  const key = e.target.id;
  console.log(e.target);
  unhighlightAll();
  switch (key) {
    case 'datavis':
      $('.highlightDatavis').css("border-color" , "lime");
      break;

    case 'designstudio':
      $('.highlightDesign').css("border-color" , "#ff00f7");
      break;

    case 'modelmaking':
      $('.highlightModelmaking').css("border-color" , "#bfff00");
      break;
  
    case 'animation':
      $('.highlightAnimation').css("border-color" , "aqua");
      break;

    case 'exhibit':
      $('.highlightExhibit').css("border-color" , "#ff6a00");
      break;
    
    case 'doc':
      $('.highlightDoc').css("border-color" , "#d000ff");
      break;

    default:
      break;
  }
}


$('.button').on("click", function() {
  $('.button').not(this).removeClass('active');
  $(this).toggleClass('active');
})

// $('.button').click(function() {

//   $("*").toggleClass('')
//   $(this).toggleClass('active');

// });
