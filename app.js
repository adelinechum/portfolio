document.getElementByClassName("thumbnails").addEventListener("click", openView, false)
document.getElementById("Gaslink").addEventListener("click", openView, false)
document.getElementById("03").addEventListener("click", openView, false)
document.getElementById("04").addEventListener("click", openView, false)
document.getElementById("05").addEventListener("click", openView, false)
document.getElementById("06").addEventListener("click", openView, false)
document.getElementById("07").addEventListener("click", openView, false)

  //escape image
  document.body.addEventListener( 'keydown', function (e) { 
    if (e.key == "Escape") {
      Array.from(document.getElementsByClassName("displayImages")).forEach(function (e) {
        e.style.display = 'none';
      })
    }
  } );

function openView (parameter) {
    var viewID = parameter.target.id
    console.log("clicked");
    switch (viewID) {
      case "Gaslink": 
      console.log("clicked");
            document.getElementById(id="GaslinkLink").style.display ='display';
                
        break;
  
      case "02": 

      break;
  
      case "03":              

  
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

