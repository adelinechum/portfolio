// document.getElementsByClassName("thumbnails").addEventListener("click", openView, false)
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);


//console.log(document.getElementsByClassName("thumbnails"));

const frames = Array.from(document.getElementsByClassName("thumbnails"));

frames.forEach(element => {

  element.addEventListener("click", openView, false)
  
});

Array.from(document.getElementsByClassName("button")).forEach(e => e.addEventListener("click", highlight, false))

function openView (parameter) {

    var viewID = parameter.target.id
    //console.log(parameter.target.id);

    switch (viewID) {

      // case "Gaslink": 
      //       var image = document.getElementById("GaslinkLink");
      //       $('iframe').append();
      //       //image.style.display = 'flex';
                
      //   break;
  
      case "Flatten": 
            var image = document.getElementById("FlattenLink");
            $('<iframe id= "FlattenLink" class="displayImages" src="https://centerforspatialresearch.github.io/summer2020_covidpolicies/"  allowtransparency="false" style="display: flex;" ></iframe>')
            .appendTo('body');
            //image.style.display = 'flex';

      break;
  
      case "Paradise":    
            var image = document.getElementById("ParadiseLink");
            $('<iframe id= "ParadiseLink" class="displayImages" src="https://adelinechum.github.io/rebuildingParadiseInterface/"  allowtransparency="false" style="display: flex;" ></iframe>')
            .appendTo('body');
            //image.style.display = 'flex';          
  
      break;
  
      case "SafeSpace":
        var image = document.getElementById("SafeSpaceLink");
        $('<iframe id= "SafeSpaceLink" class="displayImages" src="./SafeSpace.html"  allowtransparency="false" style="display: flex;" ></iframe>')
        .appendTo('body');
        //image.style.display = 'flex';    

      break;
  
      case "Housing":
        var image = document.getElementById("HousingLink");
        $('<iframe id= "HousingLink" class="displayImages" src="https://adelinechum.github.io/36YearsOfHousing/"  allowtransparency="false" style="display: flex;" ></iframe>')
        .appendTo('body');
          

      break;

      case "Furniture":
        var image = document.getElementById("FurnitureLink");
        $('<iframe id= "FurnitureLink" class="displayImages" src="./Furniture.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body'); 

      break;
  
      case "Care":
        var image = document.getElementById("CareLink");
        $('<iframe id= "CareLink" class="displayImages" src="./Care.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');

      break;

      case "Quilted":
        var image = document.getElementById("QuiltedLink");
        $('<iframe id= "QuiltedLink" class="displayImages" src="./Quilt.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');    

      break;

      case "Pillow":
        var image = document.getElementById("PillowLink");
        $('<iframe id= "PillowLink" class="displayImages" src="./Pillow.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');    

      break;

      case "SteroidPlants":
        var image = document.getElementById("SteroidPlantsLink");
        $('<iframe id= "SteroidPlantsLink" class="displayImages" src="./SteroidPlants.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');    

      break;

      case "MoMa":
        var image = document.getElementById("MoMaLink");
        $('<iframe id= "MoMaLink" class="displayImages" src="./Moma.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');    

      break;

      case "Refactoring":
        var image = document.getElementById("RefactoringLink");
        $('<iframe id= "RefactoringLink" class="displayImages" src="./Refactoring.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');   

      break;

      case "Desert":
        var image = document.getElementById("DesertLink");
        $('<iframe id= "DesertLink" class="displayImages" src="./Desert.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');   

      break;

      case "Wetlands":
        var image = document.getElementById("WetlandsLink");
        $('<iframe id= "WetlandsLink" class="displayImages" src="./Wetlands.html"  allowtransparency="false" style="display: none;" ></iframe>')
        .appendTo('body');    

      break;
    
    }
  }

    //escape image
    document.body.addEventListener( 'keydown', function (e) { 
      if (e.key == "Escape") {
        $('iframe').remove()
       // console.log(document.getElementsByClassName("displayImages"))
        // Array.from(document.getElementsByClassName("displayImages")).forEach(function (e) {
        //   // e.style.display = 'none';
        // })
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
  //console.log(e.target);
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
