import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import ReverseGeocodeLat from './components/ReverseGeocodeLat';
import moment from 'moment';
import WeatherIcons from './components/WeatherIcons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';


class App extends Component {   

 
    constructor(props) {
      super(props);

      const date = new Date();
      const dateISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();

      this.state = {
        date: date,
        formatDate: dateISO.split('T')[0],
        dataTraffic: [],
        isLoadedTraffic: false,
        isLoadedWeather: false,
        currentLocation: '01-04 Paya Lebar Rd',
        camKey: 0,
        locationCamName: [],
        camKeyPos: [],
        region: [],
        regionTown: [],
        forecast: [],
        twoHrsWeaCondi: [],
        twoHrsWeaArea: [],
        twoHrsTimeStart: [],
        twoHrsTimeEnd: [],
        weaKey: 0,
        oneDayMorning: [],
        oneDayNoon: [],
        oneDayNight: [],
        oneDayTimeValid: 0,
        oneDayMornDate: 0,
        oneDayNoonDate: 0,
        oneDayNightDate: 0,
        time: moment(),
        screenWidth: window.innerWidth,
      }

      this.handleChangeLocation = this.handleChangeLocation.bind(this);
      console.log(this.state.time.format('HH:mm:ss'))
      this.fetchTraffic();
      setTimeout(() => {
        this.fetch2hrsWeather();
      }, 300);
      setTimeout(() => {
        this.fetch1dayWeather();   
      }, 600);
      
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleWindowSizeChange);
    }
    
    componentWillUnmount() {
      window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
      this.setState({ screenWidth: window.innerWidth });
    };

    handleChangeDate = val => {
      const dateFormat = moment(val).format('YYYY-MM-DD');
      console.log(dateFormat);
      this.setState({
        date: val,
        formatDate: dateFormat,
      });    

        this.fetchTraffic();
        this.fetch2hrsWeather();
        this.fetch1dayWeather();

    }    

    handleChangeTime = val => {
      console.log(val.format('HH:mm:ss'));
      this.setState({ 
        time: val 
      });

        this.fetchTraffic();
        this.fetch2hrsWeather();
        this.fetch1dayWeather();

    };

    handleChangeLocation(event) {
      var value = event.target.value.split(',');
      console.log(value[1]) 
      console.log(this.state.twoHrsWeaCondi[value[0]])
      this.setState({ 
        weaKey: value[0],
        currentLocation: value[1],
        camKey: value[2]
      })
    }    
 

    fetchTraffic() {    
      let array = [];
      let name = [];
      let position = [];
      let region = [];
      let regionTown = [];
      let currentlocation = ''; 


      // let testarray = [{camera: ['camera1', 'cam2', 'cam3']}];
      // let testing = {userid: testarray};     
      // console.log(testing);

      fetch ('https://api.data.gov.sg/v1/transport/traffic-images?date_time=' + this.state.formatDate + 'T' 
      + this.state.time.format('HH') + '%3A' + this.state.time.format('mm') + '%3A00')
      .then(restraffic=> restraffic.json())
      .then(jsontraffic => {

        this.maxArrayTraffic = jsontraffic.items[0].cameras.length;

        // Reverse geocode the location name and sort in ascending order
        for (let i=0; i < this.maxArrayTraffic; i++) {
          array.push(ReverseGeocodeLat(jsontraffic.items[0].cameras[i].location.latitude, jsontraffic.items[0].cameras[i].location.longitude, i))
        }

        array.sort(); 

        for (let i=0; i < this.maxArrayTraffic; i++) {  
          name.push(array[i].split(',')[0])
          position.push(array[i].split(',')[3])
          region.push(array[i].split(',')[2])
          regionTown.push(array[i].split(',')[1])
        }

        for (let i=0; i < this.maxArrayTraffic; i++) {  
          if (this.state.currentLocation === name[i])          
            currentlocation = position[i];          
        }



        this.setState({
          isLoadedTraffic: true,
          dataTraffic: jsontraffic,
          locationCamName: name,  
          camKeyPos: position,               // store all the camera array key
          camKey: currentlocation,           // store the current location camera array key
          region: region,
          regionTown: regionTown
        })

      })
    }

    fetch2hrsWeather() {

      let condition = [];
      let area =[];

      fetch ('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=' + this.state.formatDate + 'T' 
      + this.state.time.format('HH') + '%3A' + this.state.time.format('mm') + '%3A00')
      .then(res2hrswea => res2hrswea.json())
      .then(json2hrswea => {

        this.maxArrayWeather = json2hrswea.items[0].forecasts.length;

        for (let i=0; i < this.maxArrayTraffic; i++) 
        {
          for (let k=0; k < this.maxArrayWeather; k++) 
          {
            if (this.state.regionTown[i] === json2hrswea.items[0].forecasts[k].area)
            {
              condition.push(json2hrswea.items[0].forecasts[k].forecast)
              area.push(this.state.regionTown[i])
            }
          }
        }

         const datestart = moment(json2hrswea.items[0].valid_period.start);
         const dateend = moment(json2hrswea.items[0].valid_period.end);

        this.setState({
         isLoadedWeather: true,
          twoHrsWeaCondi: condition,
          twoHrsWeaArea: area,
          twoHrsTimeStart: datestart.format('h:mm a'),
          twoHrsTimeEnd: dateend.format('h:mm a')
        })    
       
      })

    }

    fetch1dayWeather() {

      let morning = []
      let noon = []
      let night = []
      let mornKey, noonKey, nightKey, mornDate, noonDate, nightDate


      fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast?date_time=' + this.state.formatDate + 'T' 
      + this.state.time.format('HH') + '%3A' + this.state.time.format('mm') + '%3A00')
      .then(res1daywea => res1daywea.json())
      .then(json1daywea => {


        let timestart = moment(json1daywea.items[0].valid_period.start)
        let timeend = moment(json1daywea.items[0].valid_period.end)
        let timevalid = timestart.format('DD MMM,ha') + ' - ' + timeend.format('DD MMM,ha')

        // set the array key for 24hrs weather forecast
        if (timestart.format('HH') === '06') {
          mornKey = 0
          noonKey = 1
          nightKey = 2
          mornDate = timestart.format('DD MMM')
          noonDate = timestart.format('DD MMM')
          nightDate = timestart.format('DD MMM') + '-' + timeend.format('DD MMM')
        } 
        else if (timestart.format('HH') === '12') {
          mornKey = 2
          noonKey = 0
          nightKey = 1
          mornDate = timeend.format('DD MMM')
          noonDate = timestart.format('DD MMM')
          nightDate = timestart.format('DD MMM') + '-' + timeend.format('DD MMM')
        }
        else if (timestart.format('HH') === '18') {
          mornKey = 1
          noonKey = 2
          nightKey = 0
          mornDate = timeend.format('DD MMM')
          noonDate = timeend.format('DD MMM')
          nightDate = timestart.format('DD MMM') + ' - ' + timeend.format('DD MMM')
        } 
        else if (timestart.format('HH') === '00') {
          mornKey = 1
          noonKey = 2
          nightKey = 0
          mornDate = timeend.format('DD MMM')
          noonDate = timeend.format('DD MMM')
          nightDate = timestart.format('DD MMM') + ' - ' + timeend.format('DD MMM')
        } 


        for (let i=0; i < this.maxArrayTraffic; i++) 
        {
            if (this.state.region[i] === 'north')
            {
              morning.push(json1daywea.items[0].periods[mornKey].regions.north)
              noon.push(json1daywea.items[0].periods[noonKey].regions.north) 
              night.push(json1daywea.items[0].periods[nightKey].regions.north)              
            }
            else if (this.state.region[i] === 'south')
            {
              morning.push(json1daywea.items[0].periods[mornKey].regions.south)    
              noon.push(json1daywea.items[0].periods[noonKey].regions.south) 
              night.push(json1daywea.items[0].periods[nightKey].regions.south)           
            }
            else if (this.state.region[i] === 'east')
            {
              morning.push(json1daywea.items[0].periods[mornKey].regions.east)   
              noon.push(json1daywea.items[0].periods[noonKey].regions.east) 
              night.push(json1daywea.items[0].periods[nightKey].regions.east)            
            }
            else if (this.state.region[i] === 'west')
            {
              morning.push(json1daywea.items[0].periods[mornKey].regions.west)     
              noon.push(json1daywea.items[0].periods[noonKey].regions.west) 
              night.push(json1daywea.items[0].periods[nightKey].regions.west)          
            }
            else if (this.state.region[i] === 'central')
            {
              morning.push(json1daywea.items[0].periods[mornKey].regions.central)     
              noon.push(json1daywea.items[0].periods[noonKey].regions.central) 
              night.push(json1daywea.items[0].periods[nightKey].regions.central)          
            }
        }

        this.setState({
          oneDayMorning: morning,
          oneDayNoon: noon,
          oneDayNight: night,
          oneDayTimeValid: timevalid,     
          oneDayMornDate: mornDate,
          oneDayNoonDate: noonDate,
          oneDayNightDate: nightDate,      
        })     

      })

    }

    

    render() {      
    
      var { isLoadedTraffic, dataTraffic, camKey, camKeyPos, locationCamName, weaKey, twoHrsWeaCondi, twoHrsWeaArea, 
        twoHrsTimeStart, twoHrsTimeEnd, oneDayMorning, oneDayNoon, oneDayNight, region, time, oneDayTimeValid, oneDayMornDate, 
        oneDayNoonDate, oneDayNightDate, screenWidth } = this.state;            // isLoadedWeather 

      if (!isLoadedTraffic)  { // && !isLoadedWeather)
        return <div> Loading.. </div>
      }

      else {
         
        const timestampImg = moment(dataTraffic.items[0].cameras[camKey].timestamp).format('DD/MM/YYYY, h.mm a')
        const isMobile = screenWidth <= 500;

        ///////////////****************************** return in mobile view ************************************/////////////
        //////////////******************************************************************************************////////////
        /////////////******************************************************************************************/////////////
        if (isMobile) {
          return (
            
            <div className="wrapper">
            <header>
            <span> Date </span>
            <DatePicker className="datePicker" selected={this.state.date} maxDate={new Date()} onChange={this.handleChangeDate} dateFormat="dd/MM/yyyy" />
            <br></br> 
            <span className="lblTime"> Time </span>
            <TimePicker className="timePicker" allowEmpty={false} showSecond={false} defaultValue={time} onChange={this.handleChangeTime} format='h:mm a'use12Hours />
            <br></br>
            <span className="lblLocation"> Location </span>
            <select className="selLocation"onChange={this.handleChangeLocation}>
                { _.range(0, this.maxArrayTraffic).map(val => 
                <option key={val} value={val + ',' + locationCamName[val] + ',' + camKeyPos[val]}>{locationCamName[val]}</option>) }
            </select>
            </header>

            <br></br> 
          <Tabs className="tabLayout">
            <div className="tabList">
            <TabList>
              <Tab>2-hour Nowcast</Tab>
              <Tab>24-hour Forecast</Tab>
            </TabList>
            </div>

            
            <TabPanel className="tabContent">
              {twoHrsTimeStart} to {twoHrsTimeEnd}
              <br></br><br></br><br></br>
              {twoHrsWeaArea[weaKey]}
              <br></br>
              { WeatherIcons(twoHrsWeaCondi[weaKey]) }               
              <br></br>
              {twoHrsWeaCondi[weaKey]}
              <br></br>              
            </TabPanel>

            
            <TabPanel className="tabContent">
              {twoHrsWeaArea[weaKey]} ({region[weaKey]})
              <br></br>
              <span className="oneDayFont"> { oneDayTimeValid } </span>
              <br></br>
                      
              <div className="one-day-morn">
              <br></br>
              <span className="oneDayFont">
              { oneDayMornDate }
              </span>
              <br></br>
              { WeatherIcons(oneDayMorning[weaKey]) }   
              <br></br>            
              Morning
              <br></br>
              <span className="oneDayFont">
              6am to 12pm
              </span>
              </div>

              <div className="one-day-noon">
              <br></br>
              <span className="oneDayFont">
              { oneDayNoonDate }
              </span>
              <br></br>              
              { WeatherIcons(oneDayNoon[weaKey]) }      
              <br></br>            
              Afternoon      
              <br></br>
              <span className="oneDayFont">
              12pm to 6pm
              </span>
              </div>
              
              <div className="one-day-night">
              <br></br>
              <span className="oneDayFont">
              { oneDayNightDate }
              </span>
              <br></br>
              { WeatherIcons(oneDayNight[weaKey]) }               
              <br></br>            
              Night
              <br></br>
              <span className="oneDayFont">
              6pm to 6am
              </span>
              </div>           
            </TabPanel>
          </Tabs>

          <br></br>
          <img src={dataTraffic.items[0].cameras[camKey].image} className="trafficImg" alt="Traffic images"/>  
          <div className="timestamp">
          <span> Taken on { timestampImg } </span>    
          </div>      
          </div>

          );
        }

        else {        

        ///////////////****************************** return in web view ***************************************////////////
        //////////////******************************************************************************************////////////
        /////////////******************************************************************************************/////////////
        return (

          <div className="Wwrapper">
          <div className="WfloatLeft">
          <div className="WleftTop">
          <span> Date </span>
          <DatePicker className="WdatePicker" selected={this.state.date} maxDate={new Date()} onChange={this.handleChangeDate} dateFormat="dd/MM/yyyy"/>
          <br></br>          
          <span className="WlblTime"> Time </span>
          <TimePicker className="WtimePicker" allowEmpty={false} showSecond={false} defaultValue={time} onChange={this.handleChangeTime} format='h:mm a'use12Hours />
          <br></br>
          <span className="WlblLocation"> Location </span>
          <select className="WselLocation"onChange={this.handleChangeLocation}>
              { _.range(0, this.maxArrayTraffic).map(val => 
              <option key={val} value={val + ',' + locationCamName[val] + ',' + camKeyPos[val]}>{locationCamName[val]}</option>) }
          </select>
          </div>
          
        <div className="WleftBtm">
        <Tabs className="WtabLayout">
          <div className="WtabList">
          <TabList>
            <Tab>2-hour Nowcast</Tab>
            <Tab>24-hour Forecast</Tab>
          </TabList>
          </div>

          
          <TabPanel className="WtabContent">
            {twoHrsTimeStart} to {twoHrsTimeEnd}
            <br></br><br></br><br></br>
            {twoHrsWeaArea[weaKey]}
            <br></br>
            { WeatherIcons(twoHrsWeaCondi[weaKey]) }               
            <br></br>
            {twoHrsWeaCondi[weaKey]}
            <br></br>              
          </TabPanel>

          
          <TabPanel className="WtabContent">
            {twoHrsWeaArea[weaKey]} ({region[weaKey]})
            <br></br>
            <span className="oneDayFont"> { oneDayTimeValid } </span>
            <br></br>
                    
            <div className="one-day-morn">
            <br></br>
            <span className="oneDayFont">
            { oneDayMornDate }
            </span>
            <br></br>
            { WeatherIcons(oneDayMorning[weaKey]) }   
            <br></br>            
            Morning
            <br></br>
            <span className="oneDayFont">
            6am to 12pm
            </span>
            </div>

            <div className="one-day-noon">
            <br></br>
            <span className="oneDayFont">
            { oneDayNoonDate }
            </span>
            <br></br>              
            { WeatherIcons(oneDayNoon[weaKey]) }      
            <br></br>            
            Afternoon      
            <br></br>
            <span className="oneDayFont">
            12pm to 6pm
            </span>
            </div>
            
            <div className="one-day-night">
            <br></br>
            <span className="oneDayFont">
            { oneDayNightDate }
            </span>
            <br></br>
            { WeatherIcons(oneDayNight[weaKey]) }               
            <br></br>            
            Night
            <br></br>
            <span className="oneDayFont">
            6pm to 6am
            </span>
            </div>           
          </TabPanel>
        </Tabs>
        </div>
        </div>

        <div className="Wcontent">
        <img src={dataTraffic.items[0].cameras[camKey].image} className="WtrafficImg" alt="Traffic images"/>  
        <div className="Wtimestamp">
        <span> Taken on { timestampImg } </span>    
        </div>  
        </div>    
        </div>
        );
      }
    }

    
    }

  }


export default App;
