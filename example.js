/*

  Put the contents of this library under your Web Server root directory (eg ~/qewd/www) as:

    /components/leaflet

  Copy this file to /demo/js/map.js  (change demo to whatever your application folder is named)


 In your app.js:

import {map_page_assembly} from './map.js';

webComponents.addComponent('map_page', map_page_assembly());

webComponents.register('map', webComponents.components.map_page);


    let context = {
      paths: {
        adminui: './components/adminui/components/',
        leaflet: './components/leaflet/components/'
      },
      resourcePath: '/components/adminui/',
      leafletResourcePath: '/components/leaflet/',
      readyEvent: new Event('ready')
    };



  In your sidebar.js:

    {
      componentName: 'adminui-sidebar-nav-item',
      state: {
        title: 'Map',
        icon: 'map',
        contentPage: 'map'
      }
    },


*/


export function map_page_assembly(QEWD) {

  let component = {
    componentName: 'adminui-content-page',
    state: {
      name: 'map'
    },
    children: [
      {
        componentName: 'adminui-content-page-header',
        state: {
          title: 'Map'
        }
      },
      {
        componentName: 'adminui-content-card',
        state: {
          name: 'map-card'
        },
        children: [
          {
            componentName: 'adminui-content-card-header',
            state: {
              title: 'Map Card',
              title_colour: 'warning'
            }
          },
          {
            componentName: 'adminui-content-card-body',
            children: [
              {
                componentName: 'leaflet-root',
                state: {
                  accessToken: 'xxxxxx',
                  height: '300px'
                },
                hooks: ['getMap']
              }
            ]
          }
        ]
      }
    ]
  };

  let hooks = {
    'leaflet-root': {
      getMap: function() {
        this.renderMap(51.505, -0.09, 13);
      }
    }
  };

  return {component, hooks};
};
