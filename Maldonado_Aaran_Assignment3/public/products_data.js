products = [
    {"name" : "Saxophone" ,
    "price" : 250.00 ,
    "image" : "./images/altosaxwcase.jpg" ,
    "desc"  : "Four different saxophones" },

    {"name" : "Clarinet" ,
    "price" : 200.00 ,
    "image" : "./images/clarinetwcase3.jpg" ,
    "desc"  : "Three different clarinets" },

    {"name" : "Trumpet" ,
    "price" : 300.00 ,
    "image" : "./images/trumpet.jpg" ,
    "desc"  : "Coming soon" },

    {"name" : "Trombone" ,
    "price" : 400.00 ,
    "image" : "./images/trombonewcase.jpg" ,
    "desc"  : "Coming soon" },

    {"name" : "Piano" ,
    "price" : 600.00 ,
    "image" : "./images/piano.jpg" ,
    "desc"  : "Three different grand pianos" }
   ];



   

   //Set products variable to an array of all the data in my store//
//all iamges are from google//
var products_array = [
    {
    'type': "clarinet",
    },
    {
    'type': "saxophone",
    },
    {
    'type': "piano",
    },
    {
    'type': "miscellaneous",
    }
]
var clarinet = [
    {   "name" : "B♭ Clarinet", 
        "price" : 200.00 ,
        "image" : "./images/bbclarinet.jpg" 
    },
    { 
        "name": "Bass Clarinet",
        "price": 300.00,
        "image": "./images/bassclarinet.jpg"
    },
    { 
        "name": "Contrabass Clarinet",
        "price": 400.00,
        "image": "./images/contraclarinet.jpg"
    }
]
var saxophone = [
    {   "name" : "Alto Saxophone" ,
        "price" : 250.00 ,
        "image" : "./images/altosax.jpg" 
    },
    {
        "name": "Tenor Saxophone",
        "price": 300.00,
        "image": './images/tenorsax.jpg'
    },
    {
        "name": "Bari Saxophone",
        "price": 300.00,
        "image": './images/barisax.jpg'
    },    {
        "name": "Soprano Saxophone",
        "price": 350.00,
        "image": './images/sopranosax.jpg'
    }
]
var piano = [
    {
        "name": "Yamaha Grand Piano",
        "price": 600.00,
        "image": './images/yamahapiano.jpg'
    },    {
        "name": "Kawai Grand Piano",
        "price": 500.00,
        "image": './images/kawaipiano.jpg'
    },    {
        "name": "Steinway Grand Piano",
        "price": 700.00,
        "image": './images/steinwaypiano.png'
    }

]
var miscellaneous = [
    {
        "name":"Metronome Tuner",
        "price": 5.00,
        "image": './images/tuner.jpg'
    },    {
        "name":"Music Chair",
        "price": 5.00,
        "image": './images/musicchair.jpg'
    },    {
        "name":"Music Stand",
        "price": 5.50,
        "image": './images/musicstand.jpg'
    }

];
var allProducts = {
    "clarinet": clarinet,
    "saxophone": saxophone,
    "piano": piano,
    "miscellaneous": miscellaneous
  }

if (typeof module != 'undefined') { //module is defined
    module.exports.allProducts = allProducts;
}