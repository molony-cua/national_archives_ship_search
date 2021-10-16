// Loads the images into the viewer
function handleImages(urls,thumbs) {	
	// Creates the thumbnail images
	$("#display").attr("src",urls[0]);
	for (var thumb in thumbs){
		let html = "<td id='col"+thumb+"' class='thumbHolder'><img class='thumb' id='image"+thumb+"' src='"+thumbs[thumb]+"' alt='"+thumb+"'></td>";
		$(html).appendTo("#thumbs");
	};
	
	// When the thumbnail is clicked, changes the viewed image
	$("td.thumbHolder > img").click(function(){
		$("td.thumbHolder > img").removeClass("chosen");
		$(this).addClass("chosen");
		let viewID = $(this).attr("alt");
		$("#display").attr("src",urls[viewID]);
	});
	
	$("#progress").hide();
	$("#showImages").show();
};

// Changes the URL's hash based upon the search results (used in loading ship information dynamically)
function search() {
	let searchVal = $("#shipSearch").val();
	let arrayCheck = $.inArray(searchVal, ships);
	let newHash = "";
	
	// If the ship is not in the list (or is misspelled)
	if (arrayCheck == -1) {
		newHash = "#notFound";
	} 
	
	else {
		newHash = "#10000"+arrayCheck;		
	};
	window.location.hash = newHash;
};

// Runs the fetch of the JSON and creates arrays
function getImages(shipname){	
	$("#imageDisplay").hide();
	$("#thumbs").html("");
	var fetch_url = "https://catalog.archives.gov/api/v1/?description.item.generalRecordsTypeArray.generalRecordsType.termName=Photographs%20and%20other%20Graphic%20Materials&q="+shipname+"%20aerial%20bow";
	fetch(fetch_url, {
		method: "GET",
		headers: {
			"Authorization": "" //API Key has expired
		},
	})
	.then(function(response) {
		return response.json();
	})
	.then(function(json) {
		
		var thumbs = [];
		var urls = [];
		
		for (x in json.opaResponse.results.result) {
			
			// Prevents duplicate images from being added (issue discovered with API)
			if ('naId' in json.opaResponse.results.result[x]){
				urls.push(json.opaResponse.results.result[x].objects.object.file['@url']);
				thumbs.push(json.opaResponse.results.result[x].objects.object.thumbnail['@url']);
			}
		};
		
		handleImages(urls,thumbs);
	});
};

// Loads the page based upon the hash (this function gives us permanent URLS for each ship)
function loadHash() {
	hash = window.location.hash;
	
	// Loads blank page (used for first page load)
	if (hash == "") {
		$("#xmlHolder").hide();
	}
	
	// Shipname is not in the file
	else if (hash == "#notFound") {
		$("#xmlHolder").hide();
		
		$("#errorMessage").html("This ship was not found.<br> <i>HINT: For best results, please use autocomplete.</i>");
	}
	
	else {
		shipID = hash.substr(1); // Removes # from hash
		loadXML(shipID); // Loads the ship information
	};
};

// Creates the URLS for the ships catalog
function createURLS() {
	$.get('xml/ships.xml', function(xml){		
		
		//Selects the ship from the XML file and loads the information int the DOM
		$(xml).find("ship").each(function(){
			let id = $(this).attr("id");
			let shipName = $(this).find("shipName").text();
			let urlHTML = "<li><b>"+shipName+": </b> <a href='search.html#"+id+"'>Link</a></li>";
			$("#shipList").append(urlHTML);
		});
	});
};

// Loads Ship Information from XML File
function loadXML(shipID) {
	// Resets the view
	$("#xmlHolder").hide();
	$("#errorMessage").html("");
	
	$("#progress").show();
	
	$.get('xml/ships.xml', function(xml){		
		
		//Selects the ship from the XML file and loads the information int the DOM
		$(xml).find("ship[id="+shipID+"]").each(function(){	
			
			// Display Ship's Designation
			let shipName = $(this).find("shipName").text();
			let designation = $(this).find("designation").text();
			$("#designation").html(shipName + " " + designation);
			
			// Display Ship's Type
			let shipType = $(this).find("shipType").text();
			$("#shipType").html("<i>"+shipType+"</i>");
			
			// Display Shipyard and completion date
			let shipYard = $(this).find("shipyard").text();
			let builtDate = $(this).find("yearComplete").text();
			$("#shipYard").html(shipYard + " (" +builtDate + ")");
			
			// Display Ship's Length
			let length = $(this).find("length").text();
			let lengthString = "<b>Length: </b>"
			$("#length").html(lengthString+length);
			
			// Display Ship's Beam
			let beam = $(this).find("beam").text();
			let beamString = "<b>Beam: </b>"
			$("#beam").html(beamString+beam);
			
			// Display Ship's Draft
			let draft = $(this).find("draft").text();
			let draftString = "<b>Draft: </b>"
			$("#draft").html(draftString+draft);
			
			// Display Ship's Complement
			let complement = $(this).find("complement").text();
			let complementString = "<b>Complement: </b>"
			$("#complement").html(complementString+complement);
			
			// Display Ship Plan Location (Cabinet - Drawer - Folder)
			let planLoc = $(this).find("planLocation").text();
			let planLocString = "<b>Ship Plan Location (Cabinet - Drawer - Folder): </b>"
			$("#planLoc").html(planLocString+planLoc);
			
			// Only shows images if the ship is a US Navy vessel
			if($(this).find("isNavy").text() == "Yes"){
				$("#showImages").hide();
				getImages(shipName);
			}
			
			// Does not load images if it is not Navy, resets view
			else {
				$("#imageDisplay").hide();
				$("#showImages").hide();
				$("#thumbs").html("");
				$("#progress").hide();
			};
		});
	});
	$("#xmlHolder").show();
};