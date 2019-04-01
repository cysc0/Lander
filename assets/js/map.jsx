
import React from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

const mapStyles = {
  width: '80%',
  height: '80%',
  position: 'absolute',
  display: 'block',
};

export class MapContainer extends React.Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {}
  };


  onMarkerClick (props, marker, e) {
    console.log(props);
    console.log(e.latLng.lat());
    console.log(e.latLng.lng());
    var marker = new google.maps.marker({
      position: e.latLng,
      map: props.google.maps.map
    });
  }

  render() {
    return (
      <div id="mapContainer">
        <Map
        google={this.props.google}
        zoom={14}
        onClick={this.onMarkerClick}
        style={mapStyles}
        initialCenter={{
          lat: 42.339634,
          lng: -431.090572
        }}
        />
        <Marker
          onClick={this.onMarkerClick}
          name={'Kenyatta International Convention Centre'}
        />
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          onClose={this.onClose}
        >
          <div>
            <h4>{this.state.selectedPlace.name}</h4>
          </div>
        </InfoWindow>
      </div>
      );
    }
  }
  
  export default GoogleApiWrapper({
    apiKey: ''
  })(MapContainer);