
const fs = require('fs');
const process = require('child_process');


const likeProbability = 0.3;
let chooseFrontProbability = 0.8;


const studentNumber = 8;
const frontSeatNumber = 4;

// utilities of students
const likeChosen = 100*1000;
const likeNotChosen = 0;
const dislikeChosen = 0;
const dislikeNotChosen = 100*1000;

const frontUtility = 25*1000;

// utility of teacher 
const perfectAnswer = 100*1000;
const dumbAnswer = 0;
let teacherTotalUtility = 0;

// number of students who likes questions sits in the front
let likeNumber = 4;
let likeFrontNumber = 2;



let results = []

Array.prototype.sum = function(){
	return eval(this.join('+'));
}

Array.prototype.mean = function(){
	return eval(this.join('+'))/this.length;
}


function Student(id){
	this.id = id;
	this.like = 0;
	// 0 for back, 1 for front
	this.front = 0;
	this.utility = 0;
	this.chosen = false;
}


function initStudents(){
	let students = [];
	for(let i = 0; i < studentNumber; i++){
		students.push(new Student(i));
	}


	// set front
	let i = 0;
	students.forEach((student) => {
		if(i < frontSeatNumber){
			student.front = 1;
			i++;
		}
	});

	let likeBackNumber = likeNumber - likeFrontNumber;
	if (likeBackNumber > (studentNumber - frontSeatNumber)){
		likeFrontNumber += likeBackNumber - (studentNumber - frontSeatNumber)
		likeBackNumber = studentNumber - frontSeatNumber;
		// console.log(likeBackNumber)
	}
	// set like 
	i = 0;
	students.forEach((student) => {
		if(i < likeFrontNumber){
			student.like = 1;
			i++;
		}
	});


	if(likeBackNumber){
		for(i = 0; i < likeBackNumber; i++){
			student = students[frontSeatNumber + i];
			// console.log(student)
			// console.log(likeBackNumber)
			student.like = 1;
		}
	}


	
	// console.log(students)
	return students;
}


function choose(students){
	students.forEach((student) =>{
		student.utility = 0;
		student.chosen = false;
	})
	let isFront = Math.random() < chooseFrontProbability;
	let choice = students[Math.floor(students.length*Math.random())];
	while( choice.front != isFront ){
		choice = students[Math.floor(students.length*Math.random())];
	}
	// console.log(isFront);
	// console.log(choice)
	choice.chosen = true;
	return students;
}


function utilityOfTeacher(students){
	let choice;
	// return the utility of the teacher in this term
	students.forEach((student)=>{
		if(student.chosen){
			choice = student;
		}
	});
	if(choice.like){
		return perfectAnswer;
	}else {
		return dumbAnswer;
	}
}


function utilityOfStudents(students){
	// console.log(students)
	students.forEach((student)=>{
		if(student.front){
			student.utility += frontUtility;
		}
		
		if(student.like && student.chosen){
			student.utility += likeChosen;
		}else if(student.like && (!student.chosen)){
			student.utility += likeNotChosen;
		}else if((!student.like) && student.chosen){
			student.utility += dislikeChosen;
		}else if((!student.like) && (!student.chosen)){
			student.utility += dislikeNotChosen;
		}

	});
	return students;
}


function simulate(){
	let result = {}
	let ut = [];
	let us = [];
	let students = initStudents();
	// result['students'] = students;
	students.forEach((student) => {
		us.push([])
	});
	
	// simulate 
	for(let i = 0; i < 10000; i++){
		s = choose(students);
		ut.push(utilityOfTeacher(s));
		let u = utilityOfStudents(s)
		s.forEach((student) => {
			us[student.id].push(student.utility);
		});
	}
	us = us.map((item)=>{
		return Math.round(item.mean()/100);
	})
	ut = Math.round(ut.mean()/100);

	result['students'] = students.map((student)=>{
		result[`utility-${student.id}`] = us[student.id]
		return {
			id: student.id,
			like: student.like,
			front: student.front,
			utility: us[student.id]
		}
	});
	totalUtility = 0
	i = 0;
	while (i < studentNumber){
		totalUtility += result[`utility-${i}`];
		i++;
	}
	result['totalUtility'] = totalUtility;


	// result['studentsUtilities'] = us;
	result['teacherUtility'] = ut;
	result['likeNumber'] = likeNumber;
	result['likeFrontNumber'] = likeFrontNumber;
	result['chooseFrontProbability'] = chooseFrontProbability;
	
	results.push(result);
	// console.log(result)
}	


function main(){
	for(likeNumber = 0; likeNumber < 8; likeNumber++){
		for(likeFrontNumber = 0; likeFrontNumber <= likeNumber; likeFrontNumber++){
			console.log(likeNumber + ' - ' + likeFrontNumber)
			for(chooseFrontProbability = 0; chooseFrontProbability <= 1; chooseFrontProbability += 0.1){
				// console.log(chooseFrontProbability)
				simulate();
			}
		}
	}
	console.log(results);
	results = JSON.stringify(results, null, 4);
	fs.writeFile(`simulation-${studentNumber}.json`, results, (err)=>{
		if(err){
			console.log(err);
		}
	});

	process.exec('python analyse.py', (error, stdout, stderr) => {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
	});
}

main();








