import React, {Component} from 'react';
import { observer } from "mobx-react";
import ReactMapGL, {Marker, NavigationControl} from 'react-map-gl';

import { decorate, observable, runInAction, action } from "mobx";
import fetchJsonp from "fetch-jsonp";
import Weathermodal from './Modal';


import Mnt from './Mnt.png';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  progress: {
    position: 'absolute',
    top : '50%',
    left : '50%',
  },
  layers: {
    'margin-top': '10px'
  },
  container: {
    'display': 'flex',
    'justify-content': 'center',
    'width': '100%',
  },
  input: {
    'width': '75%',
    'margin-left': '2%',
  }
});


class Map extends Component {
  stations = [];
  status = "none"; // "none" / "fetching" / "set" / "error"
  width = window.innerWidth;
  height = window.innerHeight;
  stationStatus = {};
  weather = [];
  snow = [];
  modalOpen = false;
  elevationScale = {min: 1, max: 50};
  originalStations = [];



  async getLocations() {
    this.status = "fetching"
    try {
      const response = await fetchJsonp(`http://api.powderlin.es/stations`)
      const stations = await response.json()
      runInAction(() => {
        this.stations = this.filterClosest(stations);
        this.originalStations = stations;
        this.status = "set";
      });
    } catch (error) {
      runInAction(() => {
        this.status = "error";
      });
    }
  }






  async getWeather(station) {
    let weather = await fetch(`https://api.weather.gov/points/${station.location.lat},${station.location.lng}/forecast`);
    let finalWeather = await weather.json();

    if (finalWeather.status > 299) {
      throw new Error(`Bad Response ${finalWeather.status}`);
    }

    runInAction(() => {
      this.weather = finalWeather;
      this.stationStatus.weather = "set";
    });


  }
  async getSnow(station) {
    try {
      this.stationStatus.snow = "fetching";
      let snow = await fetchJsonp(`http://api.powderlin.es/station/${station.triplet}?days=90`);
      let finalSnow = await snow.json();
      runInAction(() => {
        this.snow = finalSnow;
        this.stationStatus.snow = "set";
      });

    } catch (error) {
      runInAction(() => {
        this.stationStatus.snow = "error";
      });
    }


  }


  showZone(station) {
    this.stationName = station.name;
    this.modalOpen = true;
    this.getWeather(station).catch((error) => {
      runInAction(() => {
        this.stationStatus.weather = "error";
      });
    });
    this.getSnow(station);
  }







  componentDidMount(){
    this.getLocations();
    window.addEventListener("resize", this.resize);
  }
  renderStationMarker = (station, index) => {
    let stationData = station.location;
    return (
      <Marker key={`marker-${index}`}
        longitude={stationData.lng}
        latitude={stationData.lat}>
        <img src={Mnt} onClick={() => this.showZone(station)} alt=""/>
      </Marker>
    )
  }

  filterElevation = (event) => {

    if (isNaN(event.target.value)) {
      return false
    } else {
      this.stations = this.filterClosest(this.originalStations).filter((v, i) => v.elevation >= event.target.value);
    }

  }
  filterClosest = (stations) => {
    return stations.filter((v, i) =>
      // // let
      v.location.lat > (this.viewport.latitude - (this.viewport.zoom * .8)) &&
      v.location.lng > (this.viewport.longitude - (this.viewport.zoom * .8))

    )

  }



  resize = () => {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.stations = this.filterClosest(this.originalStations);
  };
  onViewportChange = viewport => {
    this.viewport = viewport;
    this.stations = this.filterClosest(this.originalStations);
  }


 viewport = {
   width: this.width,
   height: this.height,
   latitude: 39.9172036,
   longitude: -105.536042,
   zoom: 8,
   bearing: 0,
   pitch: 0,
 };


  toggleModalStatus = () => {
    this.modalOpen = !this.modalOpen;
  }

  render() {
    const { classes } = this.props;
    const navStyle = {
      position: 'absolute',
      top: 10,
      left: 10
    };
    if (this.status === "none") {
      return(<div></div>)
    } else if (this.status === "fetching") {
      return(
        <div>
          <CircularProgress className={classes.progress}/>
        </div>
      )
    } else if (this.status === "set") {

      return (
        <div>
          <div>
            {this.modalOpen &&
              <Weathermodal name={this.stationName} status={this.stationStatus} modalStatus={this.modalOpen} toggleModal={this.toggleModalStatus} weather={this.weather} snow={this.snow}/>
            }
          </div>
          <div>
            <ReactMapGL mapboxApiAccessToken={process.env.REACT_APP_MAPTOKEN}
            {...this.viewport}
            onViewportChange={this.onViewportChange}
            >
            { this.stations.map(this.renderStationMarker) }
            <div className={classes.container}>
              <TextField
                id="standard-name"
                label="Filter Weather Stations by Elevation"
                placeholder="Elevation"
                className={classes.input}
                onChange={this.filterElevation}
                margin="normal"
              />
            </div>
            <div className="nav" style={navStyle}>
              <NavigationControl onViewportChange={this.onViewportChange} />
            </div>
            </ReactMapGL>
          </div>
        </div>
      );
    } else if (this.status === "error") {
      return (
        <div color="danger">Sorry Map is not Available. Please refresh.</div>
      )
    }
  }
}
decorate(Map, {
  Map: observer,
  status: observable,
  viewport: observable,
  width: observable,
  height: observable,
  stationStatus: observable,
  weather: observable,
  snow: observable,
  toggleModalStatus: action,
  filterElevation: action,
  filterClosest: action,
  modalOpen: observable,
  stations: observable,
  originalStations: observable,
  stationName: observable,
});


export default withStyles(styles)(Map);
