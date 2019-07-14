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


//Used to get average season stats from a player
function getPlayerAVG(url) 
{
  return new Promise(function(resolve, reject) 
  {
	let request = new XMLHttpRequest();   
	
	//When request is sent back...
	request.onload = function() 
	{
		  //Checks to see if request is successful 
      	  if (request.readyState === XMLHttpRequest.DONE && request.status === 200) 
		  {
		  	//Get specific average stats...
	    	playersPts = JSON.parse(request.response).data["0"]["pts"];
	    	console.log(playersPts)

	    	//Send stats to public scope
	    	resolve(playersPts)
		    
		  } 

    };
    //error checking
    request.onerror = () => 
	{
	  console.log("error")
	};

	//GET request
    request.open('GET', url);
    //Sends request to API
    request.send();
  });
}

//Used to get player's ID from local csv file
function getPlayerID(path)
{
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
			for(var x = 0; x < 3200; x++)
			{
				//Compare player's full name and returns player's ID
				if(csvData[x][1].replace(/['"]+/g, '') == players_first && csvData[x][2].replace(/['"]+/g, '') == players_last)
				{
					console.log("PLAYER ID: " + csvData[x][10])
					playersID = csvData[x][10]	
					resolve(playersID)
				}
			}
			
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
		//Send player first name, player last name, numOfPlayers2 on roster, specific live stats

		//Clears exisiting database
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
    numOfPlayers2 = items[allKeys[allKeys.length -1]]
    
	for(var rows = 0; rows < numOfPlayers2; rows++)
	{
	  var table = document.getElementById("myTable");
	  var row = table.insertRow(-1);
	  var cell1 = row.insertCell(0);
	  var cell2 = row.insertCell(-1);
	  var cell3 = row.insertCell(-1);
	  cell1.innerHTML = items[allKeys[rows]];
	  cell2.innerHTML = "Pts: 22.5"
	  cell3.innerHTML = "Traded!"
	  players.push(items[allKeys[rows]])
	}

	console.log(players)
	

		players_first = players[0].substr(0, players[0].indexOf(' '))
		players_last = players[0].substr(players[0].indexOf(' ') + 1, players[0].length - 1)
		//Get player's ID and any information about them
		getPlayerID('NBA_Data.csv').then(function(result)
		{
			var url = 'https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=' + result

			//Get player's season averages
			getPlayerAVG(url).then(function(result) 
		  {
		    console.log("Pts: " + result)
		    /*
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
			*/
		  })
		});
	
});



