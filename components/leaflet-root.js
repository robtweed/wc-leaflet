/*

 ----------------------------------------------------------------------------
 | wc-leaflet: WebComponents Library for Leaflet Mapping Module              |
 |                                                                           |
 | Copyright (c) 2020 M/Gateway Developments Ltd,                            |
 | Redhill, Surrey UK.                                                       |
 | All rights reserved.                                                      |
 |                                                                           |
 | http://www.mgateway.com                                                   |
 | Email: rtweed@mgateway.com                                                |
 |                                                                           |
 |                                                                           |
 | Licensed under the Apache License, Version 2.0 (the "License");           |
 | you may not use this file except in compliance with the License.          |
 | You may obtain a copy of the License at                                   |
 |                                                                           |
 |     http://www.apache.org/licenses/LICENSE-2.0                            |
 |                                                                           |
 | Unless required by applicable law or agreed to in writing, software       |
 | distributed under the License is distributed on an "AS IS" BASIS,         |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  |
 | See the License for the specific language governing permissions and       |
 |  limitations under the License.                                           |
 ----------------------------------------------------------------------------

 17 April 2020

*/

export function load() {

  let componentName = 'leaflet-root';
  let count = -1;
  let id_prefix = componentName + '-';

  customElements.define(componentName, class leaflet_root extends HTMLElement {
    constructor() {
      super();

      count++;
      let id = id_prefix + count;

      const html = `
<div id="${id}" style="height: 180px;"></div>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.height) {
        this.rootElement.setAttribute('style', 'height: ' + state.height + ';');
      }
      if (state.accessToken) {
        this.accessToken = state.accessToken;
      }
    }

    onLoaded() {
      this.readyEvent = new Event('mapReady');
      let _this = this;
      let prefix = '';
      if (this.context.leafletResourcePath) prefix = this.context.leafletResourcePath;
      if (this.context.paths && this.context.paths.leaflet) {
        prefix = this.context.paths.leaflet;
        if (prefix[0] === '.') prefix = prefix.slice(1);
      }
      if (prefix !== '' && prefix.slice(-1) !== '/') prefix = prefix + '/';

      this.loadCSSFile(prefix + 'css/leaflet.css', function() {
        _this.loadJSFile(prefix + 'js/leaflet.js', function() {
          _this.leaflet = L;
          _this.isReady();
        });
      });
    }

    renderMapCB(lat, long, zoom, callback) {
      let _this = this;
      let fn = function() {
        _this.map = _this.leaflet.map(_this.rootElement.id).setView([lat, long], zoom);
        _this.leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: _this.accessToken
        }).addTo(_this.map);
        if (callback) callback.call(_this);
      }
      if (this.ready) {
         fn();
      }
      else {
        this.onReady(fn);
      }
    }

    renderMapPromise(lat, long, zoom) {
      let _this = this;
      return new Promise((resolve) => {
        _this.renderMapCB(lat, long, zoom, function() {
          resolve();
        });
      });
    }

    async renderMap(lat, long, zoom) {
      return await this.renderMapPromise(lat, long, zoom);
    }

    setMarker(lat, long) {
      if (this.map) {
        return this.leaflet.marker([lat, long]).addTo(this.map);
      }
    }

    setCircle(lat, long, params) {
      if (this.map) {

        /*
          Example params:

          {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
          }
        */

        return this.leaflet.circle([lat, long], params).addTo(this.map);
      }
    }

    setPolygon(params) {
      if (this.map) {

        /*
          Example params:

          [
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
          ]
        */

        return this.leaflet.polygon(params).addTo(this.map);
      }
    }

    addPopup(text, obj, open) {
      if (obj) {
        if (open) {
          obj.bindPopup(text).openPopup();
        }
        else {
          obj.bindPopup(text);
        }
      }
    }

    setPopupAsLayer(lat, long, content) {
      if (this.map) {
        return this.leaflet.popup()
        .setLatLng([lat, long])
        .setContent(content)
        .openOn(this.map);
      }
    }

    addEventHandler(fn, type) {
      type = type || 'click';
      this.map.on(type, fn);
      this.mapEvents.push({
        type: type,
        fn: fn
      });
    }

    onReady(fn) {
      document.addEventListener('mapReady', fn);
      this.removeOnReady = function() {
        document.removeEventListener('mapReady', fn);
      }
    }

    isReady() {
      if (this.readyEvent) {
        document.dispatchEvent(this.readyEvent);
      }
      this.ready = true;
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.childrenTarget = this.rootElement;
      this.name = componentName + '-' + count;
      this.mapEvents = [];
    }

    disconnectedCallback() {
      if (this.onUnload) this.onUnload();
      let _this = this;
      this.mapEvents.forEach(function(evnt) {
        _this.map.off(evnt.type, evnt.fn);
      });
      if (this.removeOnReady) {
        this.removeOnReady();
      }
    }

  });
};
