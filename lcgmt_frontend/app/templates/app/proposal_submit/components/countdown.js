
    // Set the date we're counting down to
    var countDownDate = new Date("{{season.expiration}}").getTime();
    
    // Update the count down every 1 second
    var x = setInterval(function() {
    
      // Get today's date and time
      var now = new Date().getTime();
        
      // Find the distance between now and the count down date
      var distance = countDownDate - now;
        
      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
      // Output the result in an element with id="demo"
      // proposal_submit.html
      if(document.getElementById("counterDown")!=null)
      document.getElementById("counterDown").innerHTML = days + "d " + hours + "h "
      + minutes + "m " ;
      if(document.getElementById("counterDownFSTO")!=null)
      document.getElementById("counterDownFSTO").innerHTML = days + "d " + hours + "h "
      + minutes + "m " ;
      if(document.getElementById("countDownGO")!=null)
      document.getElementById("countDownGO").innerHTML = days + "d " + hours + "h "
      + minutes + "m " ;
        
      // If the count down is over, write some text 
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("stp_status").innerHTML = "EXPIRED";
        document.getElementById("go_status").innerHTML = "EXPIRED";

      }
    }, 1000);
  