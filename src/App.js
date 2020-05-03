import React, { Component } from 'react';
import { observer } from "mobx-react";
import { decorate, observable, action } from "mobx";


import Map from './components/Map';
// import Heatmap from './components/Heatmap';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';

import { sessionStored } from 'mobx-stored';

import ReactGA from 'react-ga';

ReactGA.initialize('UA-126660442-1', {
  debug: true,
  titleCase: false,
});

const theme = createMuiTheme({
  palette: {
    primary: { main: '#593d7d' },
    secondary: { main: '#0ef25b' },
  }
});



const defualtStatus = {'status': true};
const alertStatus = sessionStored('status', defualtStatus);

class App extends Component {

  changeAlertStatus = () => {
    alertStatus.status = false;
  }

  render() {
    return (
      <div>
        <MuiThemeProvider theme={theme}>
        <Dialog
          open={alertStatus.status}
          onClose={this.changeAlertStatus}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>

            <Typography color="primary" variant="display2" gutterBottom>Welcome!</Typography>
            <Typography variant="body2" gutterBottom>This app is meant to provide you with detailed snow history and weather predictions for all SNOTEL stations. SNOTEL data is provided with the help of <a href="http://powderlin.es/api.html" target="_blank" rel="noopener noreferrer">PowderLines API</a> and weather data is provided by NOAA. Weather predictions are based on the Lat/Lng of the SNOTEL location.</Typography>
            <Typography variant="body2" gutterBottom>Also, since the PowderLines api is a side project just like this, it can be slightly unreliable. If something does not load please try again and it should work.</Typography>
            <Typography color="secondary" variant="body1" >Disclaimer:</Typography>
            <Typography  variant="body2">Backcountry travel is inherently dangerous. Please use extreme caution and make your own decisions. This app is here to simply provide additional information.</Typography>

          </DialogContent>
          <DialogActions>
            <Button onClick={this.changeAlertStatus} color="primary">
              Got it.
            </Button>
          </DialogActions>
        </Dialog>
          <Map/>
        </MuiThemeProvider>
      </div>
    );
  }

}



export default App;

decorate(App, {
  App: observer,
  alert: observable,
  changeAlertStatus: action
});
