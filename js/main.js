function prep(){
	getStackoverflow();
}

function randomString(){
	var id="";
	for (var charInd=0; charInd<7; charInd++) {
		id+=String.fromCharCode(Math.floor(Math.random()*25)+65);
	}
	return id;
}

function getStackoverflow(){
	$.getJSON("https://api.stackexchange.com/2.0/questions?page=1&pagesize=20&order=desc&todate=1334620800&sort=creation&tagged=ios;nsset&site=stackoverflow&callback=?",
		success)
}

function success(data, textStatus, jqXHR){
	//Decide which columns I want
	var columns={
		ID:"number",
		Title:"string",
		Creation:"date",
		Answers:"number",
		Tags:"string"
	};
	
	//initialize row array
	var rows=[];
	
	//Populate row array
	for (var a=0; a<data.items.length; a++) {
		var question=data.items[a];
		var row=Object.create(columns);
		row.ID=question.question_id;
		row.Title=question.title;
		row.Score=question.score;
		row.Answers=question.answer_count;
		row.Creation=new Date();
		row.Creation.setTime(question.creation_date*1000);
		
		//remove timestamp
		row.Creation.setHours(0);
		row.Creation.setMinutes(0);
		row.Creation.setSeconds(0);
		row.Creation.setMilliseconds(0);
		
		row.Tags=question.tags.join(", ");
		rows.push(row);
	}
		
	$('#root').FilterTable({
		columns: columns,
		rows: rows,
		id: "StackOverflow",
	});
}