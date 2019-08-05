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
var avgPTS = [];
var csvData2 = new Array();
var playersTeam = []


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
	    console.log(document.body);
	    return document.body.innerHTML;
	}

	//We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
	chrome.tabs.executeScript(
	{
	    code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
	}, (results) => 
	{
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


//chrome.storage.sync.clear()
chrome.storage.sync.get(null, function(items) 
{

    var allKeys = Object.keys(items);
    numOfPlayers3 = items[allKeys[allKeys.length -1]]
    var counter = 1
    var counter2 = 1
    var counter3 = 1
    var counter4 = 1
	for(var rows = 0; rows < numOfPlayers3; rows++)
	{
	  var table = document.getElementById("myTable");
	  var row = table.insertRow(-1);
	  var cell1 = row.insertCell(0);
	  var cell2 = row.insertCell(1);
	  var cell3 = row.insertCell(2);
	  var cell4 = row.insertCell(3);
	  var cell5 = row.insertCell(4);
	  var cell6 = row.insertCell(5);


	  
	  cell1.innerHTML = "ID"
	  cell2.innerHTML = items[allKeys[rows]];
	  cell3.innerHTML = "Traded!"
	  cell6.innerHTML = "Team"
	  players.push(items[allKeys[rows]])
	}	
	for(var theCTR = 0; theCTR < numOfPlayers3; theCTR++)
	{
		players_first = players[theCTR].substr(0, players[theCTR].indexOf(' '))
		players_last = players[theCTR].substr(players[theCTR].indexOf(' ') + 1, players[theCTR].length - 1)
		//Get player's ID and any information about them
		getPlayerID('NBA_Data.csv', players_first, players_last).then(function(result)
		{
			var url = 'https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=' + result
			document.getElementById("myTable").rows[counter2].cells[0].innerHTML = result
			counter2++
			//console.log(result)

		  //Get player's season averages
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

				    //console.log(data["data"]["0"]["player_id"])
				    while(foundID == false)
				    {
				    	//console.log("IN " + data["data"]["0"]["player_id"])
				    	if(counter == numOfPlayers3 + 1)
				    	{
				    		counter = 0;
				    	}
					    if(data["data"]["0"]["player_id"] == document.getElementById("myTable").rows[counter].cells[0].innerHTML)
					    {

					    	document.getElementById("myTable").rows[counter].cells[2].innerHTML = "PPG: " + avgPTS[data["data"]["0"]["player_id"]]
					    	foundID = true
					    }

						counter++
					}


		      });
		    }
		  )
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

		  var url3 = "https://www.balldontlie.io/api/v1/players/" + result;
		  var gamesCtr = 0

		  //Get player's team
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
					    if(data["id"] == document.getElementById("myTable").rows[counter3].cells[0].innerHTML)
					    {

					    	document.getElementById("myTable").rows[counter3].cells[5].innerHTML = playersTeam[data["id"]]

					    	getTeamsPerWeek('nbaSchedule19.csv').then(function(result)
							{
								//MAKE DROPDOWN TO SELECT WEEKS TO SEE WEEKLY GAMES PLAYED FOR EACH PLAYER 
								console.log(result)
								for(var i in result["week1"]){
									if(result["week1"][i] == playersTeam[data["id"]])
									{
										gamesCtr++
									}
								}
								document.getElementById("myTable").rows[counter4].cells[4].innerHTML = gamesCtr
								counter4++

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





		});
	}
});

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

			currDay = csvData2[1][0].substring(8,10)
			console.log(currDay)

			// Retrived data from csv file content
			for (var i = 1; i < jsonObject.length; i++) 
			{

				//Check each week and add teams that are playing that week to array
				if(currDay != csvData2[i][0].substring(8,10))
				{
					teamsPlayingObj["week" + week] = teamsPlaying
					currDay = csvData2[i][0].substring(8,10)
					teamsPlaying = []
					week++

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






