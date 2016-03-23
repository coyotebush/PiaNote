//Sorts all notes in a musical piece by their time and their tone
function flatTuneList(tune) {
  var times = Object.keys(tune);

  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  var tuneList = [];
  //Flatten the times
  for(var j = 0; j < times.length; j++) {
    var time = times[j];
    var notes = tune[time];
    var noteArr = [];

    //Flatten all notes
    for (var i = 0; i < notes.length; i++) {
      //Flatten all PolyNotes
      if (Array.isArray(notes[i].tone)) {
        for (var k = 0; k < notes[i].tone.length; k++) {
          noteArr.push(notes[i].tone[k]);
        }
      }
      else {
        noteArr.push(notes[i]);
      }
    }

    noteArr.sort(function(a, b) {
      return a.tone - b.tone;
    });

    for (var i = 0; i < noteArr.length; i++) {
      tuneList.push(noteArr[i]);
    }
  }

  return tuneList;
}


function Musical_Piece(config) {
  var that = this;

  //this.piece = config;

  this.key = config.key;
  this.isSharpKey = sharpKeys.indexOf(this.key) > 0 ? true : false;
  this.time = config.time;
  this.numMeasures = config.numMeasures;
  var beatValue = WHOLE_NOTE_VALUE / this.time.rhythm;
  this.measureDuration = this.time.beats * beatValue;
  this.measureBeat = Math.floor(this.time.beats / 2);
  this.measureAccent = Math.ceil(this.time.beats / 2) * beatValue;
  while (this.measureBeat % 2 == 0) {
    this.measureBeat /= 2;
  }

  this.measureBeat *= beatValue;

  this.rhythms = this.generatePhraseRhythm();
  console.log(this.rhythms);
  this.chords = this.generateChords();
  this.piece = {};
  this.generatePiece();
}

Musical_Piece.prototype.addToPiece = function(time, note) {
  if (this.piece[time] == undefined) {
    this.piece[time] = [];
  }
  this.piece[time].push(note);
}

Musical_Piece.prototype.generatePiece = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
};

Musical_Piece.prototype.generateChords = function() {
  var chords = [];

  //alwasy start with the chord of the key
  chords.push(keyChords[0]);

  //random chords for the rest of the piece
  for (var i = 1; i < this.numMeasures - 1; i++) {
    chords.push(keyChords[Math.random() * keyChords.length << 0]);
  }

  //always end with the chord of the key
  chords.push(keyChords[0]);

  return chords;
};


Musical_Piece.prototype.generatePhraseRhythm = function() {
  var rhythms = [];
  var curMeasure = 0;
  var curBeat = 0;

  var possibleRhythms = (function() {
    var arr = [];
    Object.keys(NoteRhythms).forEach(function(key) {
      arr.push(NoteRhythms[key]);
    });
    return arr;
  })();

  var measureRhythms = [];

  //get weights based on idx.
  var cdf = 0;
  for(var i = 0; i < /*possibleRhythms.length*/4; i++) {
    cdf += i+1;
  }

  console.log(this.numMeasures);

  while(curMeasure < this.numMeasures) {
    var rhythmIdx = 0;
    var rhythm;

    //weighted pick of rhythms
    var randWieght;
    console.log(cdf);
    randWeight = Math.random() * cdf << 0;
    console.log(randWeight);
    var upTo = 0;
    for (var i = 0; i < /*possibleRhythms.length*/4; i++) {
      if (upTo + i + 1 >= randWeight) {
        rhythmIdx = i;
        break;
      }
      upTo += i + 1;
    }
    rhythm = possibleRhythms[rhythmIdx];
    
    //Pick a good rhythm to end the phrase on
    if (curMeasure == this.numMeasures - 1) {
      //If on 3rd beat, don't pick a dotted quarter
      if (curBeat == 8) {
        while(rhythm == NoteRhythms.D_QUARTER) {
          rhythmIdx = Math.random() * possibleRhythms.length << 0;
          rhythm = possibleRhythms[rhythmIdx];
        }
      }
      //always end last beat with a quarter note
      else if (curBeat == 12) {
        rhythm = NoteRhythms.QUARTER;
      }
    }

    //if the rhythm fits in the measure, add it
    if(curBeat + rhythm <= this.measureDuration) {
      var totalDur = rhythm;//rhythmDur;
      measureRhythms.push(rhythm);
      
      switch(rhythm) {
        case NoteRhythms.D_EIGTH:
          //add eighth note
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          totalDur += NoteRhythms.SIXTEENTH;
          break;
        case NoteRhythms.D_QUARTER:
        case NoteRhythms.EIGTH:
          //add eighth note
          measureRhythms.push(NoteRhythms.EIGTH);
          totalDur += NoteRhythms.EIGTH;  
          break;
        case NoteRhythms.SIXTEENTH:
          //add three 16th notes
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          totalDur += NoteRhythms.SIXTEENTH*3;  
          break;
        
        default:
          break;
      }
      
      if (curBeat + totalDur >= this.measureDuration) {
        curMeasure++;
        curBeat = 0;
        rhythms.push(measureRhythms);
        measureRhythms = [];
      }
      else {
        curBeat += totalDur;
      }
    }
  }

  return rhythms;
};



Musical_Piece.prototype.getVoiceTuneList = function() {
  var tune = this.piece;

  var times = Object.keys(tune);

  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  var tuneList = {voice1: [], voice2: []};

  for (var i = 0; i < times.length; i++) {
    var time = times[i];
    var notes = tune[time];

    notes.sort(function(a, b) {
      var comp1, comp2;
      if (Array.isArray(a.tone)) {
        comp1 = a.tone[0];
      }
      else {
        comp1 = a.tone;
      }

      if (Array.isArray(b.tone)) {
        comp2 = b.tone[0];
      }
      else {
        comp2 = b.tone;
      }

      return comp1 - comp2;
    });

    for (var j = 0; j < notes.length; j++) {
      //console.log(notes[j]);
      if (notes[j].hand == 'l') {
        tuneList.voice2.push(notes[j]);
      }
      else {
        tuneList.voice1.push(notes[j]);  
      }
      
    }
  }

  return tuneList;    
}

Musical_Piece.prototype.abcDump = function() {
  var that = this;

  //var beatValue = WHOLE_NOTE_VALUE / this.time.rhythm;
  //var measureBeat = Math.floor(this.time.beats / 2);
  /*while (measureBeat % 2 == 0) {
    measureBeat /= 2;
  }

  measureBeat *= beatValue;

  var measureDuration = this.time.beats * beatValue;
  var measureAccent = Math.ceil(this.time.beats / 2) * beatValue;*/

  //Current accidentals marks the current status of accidentals
  //that carry through the music
  var currentAccidentals = (function() { 
    var staveNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var accidentals = {
      C: '=',
      D: '=',
      E: '=',
      F: '=',
      G: '=',
      A: '=',
      B: '='};
    
    var indx;
  
    if (that.isSharpKey) {
      indx = sharpKeys.indexOf(that.key);
      
      for(i = 0; i < indx; i++) {
        staveNote = (3 + 4*i)%7;
        //sharp
        accidentals[staveNotes[(3 + 4*i)%7]] = '^';
      }
    }
    else {
      indx = flatKeys.indexOf(that.key);
      
      for (i = 0; i < indx; i++) {
        //flat
        accidentals[staveNotes[(6 + 3*i)%7]] = '_';
      }
    }
    
    return accidentals;
  })();
  
  var abc = "";
  
  //initial stuff
  abc += "M: " + this.time.beats + "/" + this.time.rhythm + "\n" 
       + "L: 1/" + WHOLE_NOTE_VALUE + "\n" 
       + "K: " + this.key + "\n"
       + "%%staves {V1 V2}\n"
       + "V: V1 clef=treble\n"
       + "V: V2 clef=bass\n";

  var that = this;
  
  function getAbcVoice(voice, name) {
    var voiceString = "[V: " + name + "]";

    var successiveEighths = 0;
    var successiveSixteenths = 0;
    var successiveRhythms = 0;
    var measureRhythm = 0;
    for (var i = 0; i < voice.length; i++) {
      var note = voice[i];

      //Make sure beams are correct
      //Unbeam if over measure
      if (measureRhythm + note.rhythm >= that.measureDuration) {
        successiveRhythms = 0;
      }
      //Beam if not on a beat
      else if (successiveRhythms + note.rhythm <= that.measureBeat && measureRhythm != that.measureAccent) {
        successiveRhythms += note.rhythm;
      }
      else {
        successiveRhythms = note.rhythm;
        voiceString += " ";
      }

      //Dump the note
      //console.log(voice[i]);
      var bundle = voice[i].abcDump(that.isSharpKey, currentAccidentals, measureRhythm, that.measureDuration, that.measureAccent);

      voiceString += bundle.sheetNote;
      currentAccidentals = bundle.accidentals;

      measureRhythm = (measureRhythm + note.rhythm) % that.measureDuration;
    }

    voiceString += "]\n";
    return voiceString;
  }

  var voices = this.getVoiceTuneList();
  abc += getAbcVoice(voices.voice1, "V1");
  abc += getAbcVoice(voices.voice2, "V2");
  
  return abc;
}

Musical_Piece.prototype.match = function(notes) {
  
  //find the closest value in the object to the query
  function findClosest(query, obj) {
    var best = 0;
    var min = Number.MAX_VALUE;
    
    for (var value in obj) {
      var num = Math.abs(obj[value] - query);
      if (num < min) {
        min = num;
        best = obj[value];
      }
    }
    
    return best;
  }


  var that = this;
  
  //get the max score from the possible raw scores
  function max(diag, left, top) {
    if (diag.raw >= left.raw && diag.raw >= top.raw) {
      return diag;
    }
    
    if (left.raw >= diag.raw && left.raw >= top.raw) {
      return left;
    }
    
    if (top.raw >= diag.raw && top.raw >= left.raw) {
      return top;
    }
  }
  
  //Generate the edit distance matrix
  function generateMatrix(expectedNotes, givenNotes) {
    var mat = [];
    for (i = 0; i < expectedNotes.length + 1; i++) {
      mat.push(new Array(givenNotes.length + 1));
      mat[i][0] = {
        raw: MATCH_SCORES.INSERTION_DELETION * i,
        dir: MatchDirection.TOP
      };

      if (i > 0) {
        mat[i][0].expected = expectedNotes[i-1].tone;
        mat[i][0].expectedRhythm = expectedNotes[i-1].rhythm
      }
    }
    
    for (j = 0; j < givenNotes.length + 1; j++) {
      mat[0][j] = {
        raw: MATCH_SCORES.INSERTION_DELETION * j,
        dir: MatchDirection.LEFT
      };
    }
    
    return mat;
  }

  var tuneList = flatTuneList(this.piece);
  console.log(tuneList);
  var matrix1 = generateMatrix(tuneList, notes);
  

  //The edit distance algorithm to match the pieces
  function matchVoice(expectedNotes, givenNotes, matrix) {
      var diag, left, top, final;

      for (i = 1; i < matrix.length; i++) {
        for (j = 1; j < matrix[i].length; j++) {
          diag = expectedNotes[i-1].match(givenNotes[j-1]);
          diag.raw += matrix[i-1][j-1].raw;
          
          left = {
            raw: MATCH_SCORES.INSERTION_DELETION + matrix[i][j-1].raw,
            dir: MatchDirection.LEFT,
            expected: expectedNotes[i-1].tone,
            expectedRhythm: expectedNotes[i-1].rhythm
          };
          
          top = {
            raw: MATCH_SCORES.INSERTION_DELETION + matrix[i-1][j].raw,
            dir: MatchDirection.TOP,
            expected: expectedNotes[i-1].tone,
            expectedRhythm: expectedNotes[i-1].rhythm
          };
          
          final = max(diag, left, top);
          
          matrix[i][j] = final;
        }
      }
      
      var results = {
        expectedNotes: expectedNotes, 
        notes: [],
        scores: [],
        totals: {
          notesMissed: 0,
          notesHit: 0,
          rhythmsHit: 0,
          rhythmsMissed: 0,
          overallAccuracy: 0
        },
      };
      
      var current;
      var i = matrix.length - 1;
      var j = matrix[i].length - 1;
      
      while(i > 0 || j > 0) {
        current = matrix[i][j];
        var expectedNote = expectedNotes[i-1];
        var actualNote = givenNotes[j-1];
        
        if (current.dir == MatchDirection.DIAG) {
          expectedNote.performedTone = actualNote.tone;

          results.notes.unshift(actualNote);
          results.scores.unshift(current);
          if(current.tone == MATCH_SCORES.TONE_MATCH) {
            results.totals.notesHit++;
          }
          else {
            results.totals.notesMissed++;
          }
          
          if (current.rhythm == MATCH_SCORES.RHYTHM_MATCH) {
            expectedNote.performedRhythm = expectedNote.rhythm;
            results.totals.rhythmsHit++;
          }
          else {
            expectedNote.performedRhythm = findClosest(actualNote.rhythm, NoteRhythms);
            results.totals.rhythmsMissed++;
          }
          i--;
          j--;
        }
        else if (current.dir == MatchDirection.LEFT) {
          //Note insertion on user's side, we ignore it.
          j--;
        }
        else if (current.dir == MatchDirection.TOP) {
          //Note deletion, count as the user resting.
          expectedNote.performedRhythm = REST;
          expectedNote.performedTone = REST;
          results.notes.unshift(new Note({tone: REST, rhythm: expectedNote.rhythm}));
          results.scores.unshift(current);
          results.totals.notesMissed ++;
          results.totals.rhythmsMissed ++;
          i--;
        }
        
      }
      
      while (i > 0) {
        results.notes.unshift(new Note({tone: REST, rhythm: expectedNotes[i-1].rhythm}));
        results.scores.unshift(matrix[i][j]);
        results.totals.notesMissed++;
        results.totals.rhythmsMissed++;
        i--;
      }
      
      results.totals.overallAccuracy = 
        (results.totals.notesHit + results.totals.rhythmsHit) /
        (results.notes.length * 2) * 100;
      
      return results;
  }
  
  var results = matchVoice(tuneList, notes, matrix1);

  return results;
  
};

Musical_Piece.prototype.generatePhrase = function(startMeasure, endMeasure, hand, possibleIntervals) {
  var tones = [];
  //offset from c
  var baseOfKey = keys[this.key];
  
  //base of octave
  var baseTone = hand == 'l' ? LOW_C : MIDDLE_C;
  baseTone += baseOfKey;

  function getPossibleIntervalsForChord(chord, intervals) {
    var chordIntervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
    var chordIntervalsMappedToKey = chordIntervals.map(function(i) {
        return chord.interval + i;
    });

    var possibleIntervals = [];
    //find all intervals that the chord hits that are within the interval range
    for(var i = 0; i < intervals.length; i++) {
      for(var j = 0; j < chordIntervalsMappedToKey.length; j++) {
        if(intervals[i] == chordIntervalsMappedToKey[j]) {
          possibleIntervals.push(intervals[i]);
          break;
        }
      }
    }

    return possibleIntervals;
  }

  var that = this;

  //NOT CURRENTLY USED
  function filterOutChordIntervals(e) {
    for (var i = 0; i < chord.notes.length; i++) {
      if (baseTone + e == chord.notes[i]) {
        return false;
      }
    }
    return true;
  }

  function generateMeasureNotes(possibleIntervals, curMeasure) {
    var tones = [];
    var rhythms = that.rhythms[curMeasure];
    var chord = that.chords[curMeasure];
    
    //get all intervals that the chord hits that are within the interval range 
    var chordIntervals = getPossibleIntervalsForChord(chord, possibleIntervals);
    //ensure left and right hand don't play same note at same time
    chordIntervals = chordIntervals;//.filter(filterOutChordIntervals);
    var pIntervals = possibleIntervals;//.filter(filterOutChordIntervals);

    var time = curMeasure*that.measureDuration;
    //generate first note by taking an interval that is in the chord      
    var interval = chordIntervals[Math.random()*chordIntervals.length << 0];
    var tone = baseTone + interval; 
    var note = new SingleNote({tone: tone, rhythm: rhythms[0], hand: hand});
    that.addToPiece(time, note);
    
    //update the current time
    time += rhythms[0];

    //tones.push(tone);

    //generate next notes
    for(var i = 1; i < rhythms.length; i++) {
      //Make sure last note of the song ends on a chord note
      if(i == rhythms.length - 1 && curMeasure == that.numMeasures - 1) {
        interval = chordIntervals[Math.random()*chordIntervals.length << 0];
      }
      else {
        interval = pIntervals[Math.random()*pIntervals.length << 0];  
      }
      tone = baseTone + interval;
      var note = new SingleNote({tone: tone, rhythm: rhythms[i], hand: hand});
      that.addToPiece(time, note);
      
      time+= rhythms[i];
      //tones.push(tone);
    }

    return tones;
  } 

  for(var i = startMeasure; i <= endMeasure; i++) {
    generateMeasureNotes(possibleIntervals, i);
  }
}

Musical_Piece.prototype.addRests = function(startMeasure, endMeasure, hand) {
  
  for (var i = startMeasure; i <= endMeasure; i++) {
    var note = new SingleNote({tone: REST, rhythm: this.measureDuration, hand: hand});
    var time = i*this.measureDuration;
    this.addToPiece(time, note);
  }

}


//all subclasses of musical piece

function SeparateHandPiece(config) {
  Musical_Piece.call(this, config);
}

SeparateHandPiece.prototype = Object.create(Musical_Piece.prototype);
SeparateHandPiece.prototype.constructor = SeparateHandPiece;

SeparateHandPiece.prototype.generatePiece = function() {
  var rightThumbPosition = Math.random() * 4 << 0;
  var rlowestIntervalIdx = rightThumbPosition;
  var rhighestIntervalIdx = rightThumbPosition + 5;
  var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
  this.generatePhrase(0, 1, 'r', possibleIntervalsR);
  this.addRests(0,1,'l');


  var leftPinkyPosition = Math.random() * 4 << 0;
  var llowestIntervalIdx = leftPinkyPosition;
  var lhighestIntervalIdx = leftPinkyPosition + 5;
  var possibleIntervalsL = NoteIntervals.slice(llowestIntervalIdx, lhighestIntervalIdx);
  this.generatePhrase(2, 3, 'l', possibleIntervalsL);
  this.addRests(2,3, 'r');

};



function ChordPiece(config) {
  Musical_Piece.call(this, config);
  console.log(this);
}

ChordPiece.prototype = Object.create(Musical_Piece.prototype);
ChordPiece.prototype.constructor = ChordPiece;

ChordPiece.prototype.generatePiece = function() {
  var rightThumbPosition = Math.random() * 4 << 0;
  var rlowestIntervalIdx = rightThumbPosition;
  var rhighestIntervalIdx = rightThumbPosition + 5;
  var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
  this.generatePhrase(0, 3, 'r', possibleIntervalsR);

  this.generateLeftHandChords();
}

ChordPiece.prototype.generateLeftHandChords = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

//subclasses of chord piece
function TriadPiece(config) {
  ChordPiece.call(this, config);
} 

TriadPiece.prototype = Object.create(ChordPiece.prototype);
TriadPiece.prototype.constructor = TriadPiece;

TriadPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  for (var i = 0; i < this.numMeasures; i++) {
    var note = new Triad({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    var time = i*this.measureDuration;
    this.addToPiece(time, note);
  }
}

function SuspendedChordPiece(config) {
  ChordPiece.call(this, config);
}

SuspendedChordPiece.prototype = Object.create(ChordPiece.prototype);
SuspendedChordPiece.prototype.constructor = SuspendedChordPiece;

SuspendedChordPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  var note = new Triad({tone: baseTone + this.chords[0].interval, chord: this.chords[0], rhythm: this.measureDuration, hand: 'l'});
  var time = 0;
  this.addToPiece(time, note);

  for (var i = 1; i < this.numMeasures - 1; i++) {
    note = new SuspendedChord({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    time = i*this.measureDuration;
    this.addToPiece(time, note);  
  }

  var lastMeasure = this.numMeasures - 1;
  var note = new Triad({tone: baseTone + this.chords[lastMeasure].interval, chord: this.chords[lastMeasure], rhythm: this.measureDuration, hand: 'l'});
  var time = lastMeasure*this.measureDuration;
  this.addToPiece(time, note);
}

function InvertedChordPiece(config) {
  ChordPiece.call(this, config);
}

InvertedChordPiece.prototype = Object.create(ChordPiece.prototype);
InvertedChordPiece.prototype.constructor = InvertedChordPiece;

InvertedChordPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  var note = new Triad({tone: baseTone + this.chords[0].interval, chord: this.chords[0], rhythm: this.measureDuration, hand: 'l'});
  var time = 0;
  this.addToPiece(time, note);

  for (var i = 1; i < this.numMeasures - 1; i++) {
    note = new InvertedChord({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    time = i*this.measureDuration;
    this.addToPiece(time, note);  
  }

  var lastMeasure = this.numMeasures - 1;
  var note = new Triad({tone: baseTone + this.chords[lastMeasure].interval, chord: this.chords[lastMeasure], rhythm: this.measureDuration, hand: 'l'});
  var time = lastMeasure*this.measureDuration;
  this.addToPiece(time, note);  
}

function MixedChordPiece(config) {
  
}



//end chordPieces


function HandsTogetherPiece(config) {
  Musical_Piece.call(this, config);
}


HandsTogetherPiece.prototype = Object.create(Musical_Piece.prototype);
HandsTogetherPiece.prototype.constructor = HandsTogetherPiece;

HandsTogetherPiece.prototype.generatePiece = function() {
  var rightThumbPosition = Math.random() * 4 << 0;
  var rlowestIntervalIdx = rightThumbPosition;
  var rhighestIntervalIdx = rightThumbPosition + 5;
  var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
  this.generatePhrase(0, 3, 'r', possibleIntervalsR);
  

  var leftPinkyPosition = Math.random() * 4 << 0;
  var llowestIntervalIdx = leftPinkyPosition;
  var lhighestIntervalIdx = leftPinkyPosition + 5;
  var possibleIntervalsL = NoteIntervals.slice(llowestIntervalIdx, lhighestIntervalIdx);
  this.generatePhrase(0, 3, 'l', possibleIntervalsL);

};


function HandsTogetherComplexPiece() {

}

