/*
	File is for managing data from API, csv file, and database 
*/

//Variables
var players_first
var numberPlayers = 0;
var players_last
var players_full
var players = []
var playersRealName 
var playersID
var playersPts
var csvData = new Array();
var firstNameArr = []
var lastNameArr = []
var globalCtr = 0;
var csvData2 = new Array();
var playersTeam = []

var avgPTS = [];
var avgASTS = [];
var avgREBS = [];
var avgSTLS = [];
var avgBLKS = [];
var avg3PTM = [];
var avgTO = [];
var avgFGP = [];
var avgFTP = [];

var avgTotalPerWeek = 0;
var avgTotalPerWeekArr = []


//Used to get player's ID from local csv file
function getPlayerID(path, firstName, lastName)
{
	firstNameArr.push(firstName)
	lastNameArr.push(lastName)
	return new Promise(function(resolve, reject)
	{

		let request = new XMLHttpRequest();  

		request.onload = function() 
		{
 			//Converts csv file into an array
			var jsonObject = request.responseText.split(/\r?\n|\r/);
			for (var i = 0; i < jsonObject.length; i++) 
			{
			  csvData.push(jsonObject[i].split(','));
			}
			// Retrived data from csv file content
			for(var x = 0; x < jsonObject.length - 1; x++)
			{

				//Compare player's full name and returns player's ID
				if(csvData[x][1].replace(/['"]+/g, '') == firstNameArr[globalCtr] && csvData[x][2].replace(/['"]+/g, '') == lastNameArr[globalCtr])
				{

					//console.log("PLAYER ID: " + csvData[x][10])
					playersID = csvData[x][10]	
					resolve(playersID)
					
					
				}
			}
			globalCtr++
		};

		request.onerror = () => 
		{
	  		console.log("error")
		};
		request.open("GET", path);   
		request.send(); 

  });

}


//Needs to go through database and check for name in webpage, once it finds a name, it will add to roster
//Add roster to database
document.getElementById("addTeamBtn").addEventListener('click', () => 
{

    function modifyDOM() 
    {
    //You can play with your DOM here or check URL against your regex
	    console.log('Tab script:');
	    //console.log(document.body);
	    return document.body.innerHTML;
	}

	//We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
	chrome.tabs.executeScript(
	{
	    code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
	}, (results) => 
	{
		//console.log(results[0])
		//Get player's name from fantasy team roster
		var index = 0
		//Find number of players in roster
		for(var count1 = 0; count1 < results[0].length; count1+=2000)
		{
			var chunks = results[0].substring(count1, count1+2000)
			if(chunks.includes("Nowrap name"))
			{
				numberPlayers++;
			}
		}
		for(var count2 = 0; count2 < 40; count2++)
		{
			//console.log(results[0])
			var one = results[0].indexOf("Nowrap name", index)
			while(results[0][one] != '<')
			{
				players_first += results[0][one]
				one++;
			}
			players_first = players_first.substring(players_first.indexOf(">") + 1)
			players.push(players_first)
			index = one 
			players_first = ""
			if(count2 == numberPlayers - 1)
			{
				break;
			}
		}

		//This section is to add information to the database
		//Send player first name, player last name, numOfPlayers3 on roster, specific live stats

		var storage = chrome.storage.sync;
		for(var i = 0; i < numberPlayers; i++)
		{
			var name = 'name' + i

			var obj= {};

			obj[name] = players[i];
			//console.log(obj)

			storage.set(obj);
	    }
	    storage.set({numPlayers: numberPlayers})

	
	});
});

var storage = chrome.storage.sync;
storage.set({name0: 'Trae Young'})
storage.set({name1: 'Paul George'})
storage.set({numPlayers: 2})


//CHECK ADD TEAM BUTTON AND ADD TABLE HEADER WHENEVER A NEW WEEK IS CHOSEN
var table = document.getElementById("tb");

//myFunction - checks for statistics and information for every player on your team
function myFunction(){

	//Clear database if needed
	//chrome.storage.sync.clear()

	//Get player's names and total # of players on team
	chrome.storage.sync.get(null, function(items) 
	{
	    var allKeys = Object.keys(items);
	    numOfPlayers3 = items[allKeys[allKeys.length -1]]
	    var counter = 0
	    var counter2 = 0
	    var counter3 = 0
	    var counter4 = 0
	    var counter5 = 0
	    //Clears table body when new week is selected
	    $('#tb').empty()

	    //Adds rows & cells to table body
		for(var rows = 0; rows < numOfPlayers3; rows++)
		{
		  var row = table.insertRow(-1);
		  var cell1 = row.insertCell(0);
		  var cell2 = row.insertCell(1);
		  var cell3 = row.insertCell(2);
		  var cell4 = row.insertCell(3);
		  var cell5 = row.insertCell(4);
		  var cell6 = row.insertCell(5);

		  
		  cell1.innerHTML = "Wait!"
		  cell2.innerHTML = items[allKeys[rows]];
		  cell3.innerHTML = "Wait!"
		  cell6.innerHTML = "Wait!"
		  players.push(items[allKeys[rows]])
		}	

		//Get stats and info for players
		for(var theCTR = 0; theCTR < numOfPlayers3; theCTR++)
		{
			players_first = players[theCTR].substr(0, players[theCTR].indexOf(' '))
			players_last = players[theCTR].substr(players[theCTR].indexOf(' ') + 1, players[theCTR].length - 1)

			//Get player's ID and any information about them
			getPlayerID('NBA_Data.csv', players_first, players_last).then(function(result)
			{
			  //Get player's season averages
			  var url = 'https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=' + result
			  document.getElementById("tb").rows[counter2].cells[0].innerHTML = result
			  counter2++

			  fetch(url)
			  .then(
			    function(response) 
			    {
			      
			      if (response.status !== 200) {
			        console.log('Looks like there was a problem. Status Code: ' +
			          response.status);
			        return;
			      }

			      // Examine the text in the response
			      response.json().then(function(data) 
			      {

			      	    var foundID = false

			      		avgPTS[data["data"]["0"]["player_id"]] = data["data"]["0"]["pts"]
			      		avgASTS[data["data"]["0"]["player_id"]] = data["data"]["0"]["ast"]
			      		avgREBS[data["data"]["0"]["player_id"]] = data["data"]["0"]["reb"]
			      		avgSTLS[data["data"]["0"]["player_id"]] = data["data"]["0"]["stl"]
			      		avgBLKS[data["data"]["0"]["player_id"]] = data["data"]["0"]["blk"]
			      		avg3PTM[data["data"]["0"]["player_id"]] = data["data"]["0"]["fg3m"]
			      		avgTO[data["data"]["0"]["player_id"]] = data["data"]["0"]["turnover"]
			      		avgFGP[data["data"]["0"]["player_id"]] = data["data"]["0"]["fg_pct"]
			      		avgFTP[data["data"]["0"]["player_id"]] = data["data"]["0"]["ft_pct"]

			      		var selectedStat = document.getElementById("selectedStat").value

					    //console.log(data["data"]["0"]["player_id"])
					    while(foundID == false)
					    {
					    	//console.log("IN " + data["data"]["0"]["player_id"])
					    	if(counter == numOfPlayers3 + 1)
					    	{
					    		counter = 0;
					    	}
						    if(data["data"]["0"]["player_id"] == document.getElementById("tb").rows[counter].cells[0].innerHTML)
						    {
						    	if(selectedStat == "PTS")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "P/G: " + avgPTS[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "ASTS")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "A/G: " + avgASTS[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "REBS")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "R/G: " + avgREBS[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "STLS")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "S/G: " + avgSTLS[data["data"]["0"]["player_id"]]	
						    	else if(selectedStat == "BLKS")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "B/G: " + avgBLKS[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "3PTM")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "3PTM/G: " + avg3PTM[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "TO")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "TO/G: " + avgTO[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "FGP")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "FGP/G: " + avgFGP[data["data"]["0"]["player_id"]]
						    	else if(selectedStat == "FTP")
						    		document.getElementById("tb").rows[counter].cells[2].innerHTML = "FTP/G: " + avgFTP[data["data"]["0"]["player_id"]]

						    	avgTotalPerWeek =  (avgASTS[data["data"]["0"]["player_id"]] + avgPTS[data["data"]["0"]["player_id"]] + avgREBS[data["data"]["0"]["player_id"]]
						    	+ avgSTLS[data["data"]["0"]["player_id"]] + avgBLKS[data["data"]["0"]["player_id"]] + avg3PTM[data["data"]["0"]["player_id"]] + data["data"]["0"]["fg3m"]
						        + (avgFGP[data["data"]["0"]["player_id"]] * 100) 
						        + (avgFTP[data["data"]["0"]["player_id"]] * 100)) 
						        - avgTO[data["data"]["0"]["player_id"]] 

						        avgTotalPerWeekArr[counter] = avgTotalPerWeek
						        foundID = true


						    }


							counter++
						}

			      });
			    })
			  .then(function()
			  {

				  //Get player's team
				  var url3 = "https://www.balldontlie.io/api/v1/players/" + result;
				  var gamesCtr = 0
				  var playerctr = 0

				  fetch(url3)
				  .then(
				    function(response) 
				    {

				      if (response.status !== 200) {
				        console.log('Looks like there was a problem. Status Code: ' +
				          response.status);
				        return;
				      }

				      // Examine the text in the response
				      response.json().then(function(data) 
				      {

				      	    var foundID = false

				      		playersTeam[data["id"]] = data["team"]["full_name"]

						    while(foundID == false)
						    {
						    	if(counter3 == numOfPlayers3 + 1)
						    	{
						    		counter3 = 0;
						    	}
							    if(data["id"] == document.getElementById("tb").rows[counter3].cells[0].innerHTML)
							    {

							    	document.getElementById("tb").rows[counter3].cells[5].innerHTML = playersTeam[data["id"]]
							    	
							    	getTeamsPerWeek('nbaSchedule20.csv').then(function(result)
									{
										//MAKE DROPDOWN TO SELECT WEEKS TO SEE WEEKLY GAMES PLAYED FOR EACH PLAYER 
										//console.log(result)
										for(var i in result[document.getElementById("selectWeek").value]){
											if(result[document.getElementById("selectWeek").value][i] == playersTeam[data["id"]])
											{
												gamesCtr++
											}
										}
										document.getElementById("tb").rows[counter4].cells[3].innerHTML = (avgTotalPerWeekArr[counter5] * gamesCtr).toFixed(1)
										document.getElementById("tb").rows[counter4].cells[4].innerHTML = gamesCtr
										counter4++
										counter5++

									});

							    	foundID = true
							    }

								counter3++
							}


				      });
				    }
				  )
				  .catch(function(err) {
				    console.log('Fetch Error :-S', err);
			  	});			  
			})
			  .catch(function(err) {
			    console.log('Fetch Error :-S', err);
			  });


			  //Get player's live stats (WAIT FOR SEASON TO START)
			  var url2 = "https://www.balldontlie.io/api/v1/stats?seasons[]=2019&player_ids[]=" + result + "&postseason=false";

			  fetch(url2)
			  .then(
			    function(response) 
			    {
			      
			      if (response.status !== 200) {
			        console.log('Looks like there was a problem. Status Code: ' +
			          response.status);
			        return;
			      }
			  	  // Examine the text in the response
			      response.json().then(function(data) 
			      {
			      		//console.log(data)
			      	    


			      });
			    }
			  )
			  .catch(function(err) {
			    console.log('Fetch Error :-S', err);
			  });





			});
		}
	});
}

/*
$.ajax({
  type: "POST",
  url: 'https://api.hooksdata.io/v1/subscriptions?api_key=_2TufI6CNcxpistjotZiHL0Q__GztMCX7VPyulJ_aMWlbjfNK6xdVQHEicNRRPdIMzE1Mw',
  data: {
    
  "description": "The Verge RSS updates",
  "alias": "the_verge_rss",
  "query": "SELECT * FROM RSS('\''https://www.theverge.com'\'')"
  },
  success: function(data) {
    console.log(data);
    //do something when request is successfull
  },
  dataType: "json"
});
*/

//Get which teams are playing each week
function getTeamsPerWeek(path)
{

		let request = new XMLHttpRequest();  
		var ctr = 0
		var currDay = ''
		var teamsPlaying = []
		var teamsPlayingObj = {}
		var week = 1
		var newWeek = true
	return new Promise(function(resolve, reject)
	{
		request.onload = function() 
		{
 			//Converts csv file into an array
			var jsonObject = request.responseText.split(/\r?\n|\r/);
			//console.log(jsonObject)

			for (var i = 0; i < jsonObject.length; i++) 
			{
			  csvData2.push(jsonObject[i].split(','));
			}

			currDay = csvData2[1][0].substring(0,3)
			//console.log(currDay)

			// Retrived data from csv file content
			for (var i = 1; i < jsonObject.length; i++) 
			{
				//Check each week and add teams that are playing that week to array
				//console.log(currDay)
				currDay = csvData2[i][0].substring(0,3)
				if(currDay == 'Mon' && newWeek)
				{
					teamsPlayingObj["week" + week] = teamsPlaying
					teamsPlaying = []
					week++
					newWeek = false
				}
				if(currDay != 'Mon' && newWeek == false){
					newWeek = true
				}
				teamsPlaying.push(csvData2[i][1])
				teamsPlaying.push(csvData2[i][2])
				
			}
			resolve(teamsPlayingObj)
			
		};

		request.onerror = () => 
		{
	  		console.log("error")
		};
		request.open("GET", path);   
		request.send(); 
	});
}
//Initial run
myFunction()
//Event listener for when week dropdown
document.getElementById("selectWeek").addEventListener("change", myFunction);
document.getElementById("selectedStat").addEventListener("change", myFunction);






