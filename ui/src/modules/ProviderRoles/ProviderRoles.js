import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
// import map from 'lodash/map';
import { Accordion, AccordionSection } from '../../components/Accordion-new';
// import { bindActionCreators } from 'redux';

// import { connect } from 'react-redux';

class ProviderRoles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addedProviderTypes: [],
      defaultServicesByProvider: this.reshapeNewServicesByProvider(),
      customServicesByProvider: this.reshapeNewServicesByProvider(),
    };
  }
  
  /**
   * This function takes the value of state.currentModelOutput (provided as a prop) and reshapes it to make it easier to work with
   * Create a dictionary of service providers from the provided `servicesByProvider` state object
   * @todo this is a bandaid. The format of the data should match the output of this function. Any data shaping to aid in 
   * usability should be done by the API before it's delivered to the UI. 
   * This is also the format for delivering updated values to the model. 
   */
  reshapeNewServicesByProvider = () => {
    /** destriucture servicesByProvider, passed in via props, to make it easier to work with */
    let { servicesByProvider } = this.props;

    /** 
     * a dictionary of service providers, using the provider name as the key
     * @typedef transformedServicesByProvider - provider attributes and services, using provider name as the key
     * @property { string } provider_type - the full name of the provider type
     * @property { string } provider_abbr - the abbrevated name of the provider type
     * @property { Object } provider_services - the services that a provider can perform  
     */
    let transformedServicesByProvider = _.reduce(servicesByProvider, (prev, provider) => {
      // let providerAbbr = Object.getOwnPropertyName(provider);
      let providerType = provider.provider_type;
      // create a list of service categories using keys of the provider services 
      // array (which corespond to the service category) to be used when creating 
      // the service category object.

      /**
       * @todo fix typo in json response that adds an extra colon.
       */
      let service_categories = provider['services:'].reduce((prev, item) => { return [...prev, Object.keys(item)[0]] }, [])

      // Create a `service_categories` array containing category objects that 
      // describe the category and all services within it.
      let services = _.reduce(provider['services:'], (previous, item, index) => {
        // Use the index of the current service to get it's `service_category`
        // from the array of `service_categories.
        let serviceCategoryName = service_categories[index];

        let services = _.reduce(item, (previous, service) => {

          /** iterate over services within a service category and create objects */
          let services = Object.values(service)
            .reduce((previous, service) => {
              let service_name = Object.getOwnPropertyNames(service)[0];
              let service_info = Object.values(service)[0];

              let service_attrs = {
                service_name,
                service_info,
              }
              return previous = { ...previous, [service_name]: service_attrs};
            }, {});

          let serviceObj = {
            service_category: serviceCategoryName,
            services,
          }

          return previous = {...previous, ...serviceObj};
        }, {})
        return { ...previous, [serviceCategoryName]: services}
      }, {})


      let newProviderServices = {
        // provider_abbr: providerAbbr,
        provider_type: providerType,
        provider_services: services,
      };
      return {...prev, [providerType]: newProviderServices};
    }, {});

    return transformedServicesByProvider;
  }


  /**
   * Filter the provider list by providers available in a specific area
   */
  filteredServicesByProvider = () => {
    let { availableProviders } = this.props.activeFilters.geo;
    let { addedProviderTypes } = this.state;

    if (availableProviders.length === 0 ) return this.state.customServicesByProvider;

    let providersList = [...availableProviders, ...addedProviderTypes]


    let foo = providersList.reduce( (previous, provider) => {

      let current = this.state.customServicesByProvider[provider];
      // let current = this.state.customServicesByProvider.filter(item => {

      //   return provider === item.provider_type;
      // });
      let next = [...previous, current]
      return next;
      }, [])
      // get only the providers available in a specific area 
      // 
      return foo;
  }

  updateScoreValue = (services, index, e) => {
    let currentServiceAttrs = services[index];

    currentServiceAttrs.service_info.score = Number.parseFloat(e.target.value).toFixed(2);

    this.props.updateModelAttributes(currentServiceAttrs)
  }

  sliderColor = (usagePercentage) => {
    if (usagePercentage >= 80) {
      return '#b30000';
    } else if (usagePercentage > 75){
      return '#e68200';
    } else if (usagePercentage <= 10){
      return '#0c3f68';
    } else {
      return '#308715';
    }
  }

  // helpful for scrabmling strings for unique keys when mapping
  scrambleString = (string) => {
    let newString = _.camelCase(string);
    let stringArray = newString.split('');
    let scrambledArray = _.shuffle(stringArray);
    let scrambledString = scrambledArray.join('');
    return scrambledString;
  }
  
  renderServices = (services) => {
    return Object.values(services).map((service, index) => {
      
      let usagePercentage = Number.parseFloat(service.service_info.score * 100).toFixed(0);
      let sliderColor = this.sliderColor(usagePercentage);

      return (
        <div
          key={this.scrambleString(`${service.service_name}${usagePercentage}${index}`)}
          className="provider-roles__service-attributes" >
          <p className="provider-roles__service-label">
            {service.service_name}
          </p>
          <p>BOL/TOL: <span style={{color: sliderColor}}>{usagePercentage}%</span></p>
          <input 
            type="range" 
            min="0" 
            max="1" 
            value={service.service_info.score}
            step="0.01" 
            className="slider"
            onChange={(e) => this.updateScoreValue(services, index, e)}></input>
        </div>
    )})
  }

  renderServiceCategories = (categories) => {
      return Object.values(categories).map(providerServices => {
        return (
          <div 
            key={this.scrambleString(providerServices.service_category)}
            className="provider-roles__category">
            <p
              className="provider-roles__category-header">
              {providerServices.service_category}
            </p>
            <div className="provider-roles__category-body">
              {this.renderServices(providerServices.services)}
            </div>
          </div>
        )
      })
  }

  renderProviders = (providers) => {

    
    
    return Object.values(providers).map(provider => {
      return (
        <AccordionSection 
          label={provider.provider_type}
          headerClassName="provider-roles__section-title"
          key={this.scrambleString(provider.provider_type)} >
          <p className="provider-roles__section-title">
            {provider.provider_type} Services
          </p>
          {/* 
            onClick={() => this.props.updateModelAttributes(provider.provider_type, provider)} */}
          {this.renderServiceCategories(provider.provider_services, provider)}
        </AccordionSection>
      );

    })
  }

  render() {
    const { area } = this.props.activeFilters.geo;


    const filteredProviders = this.filteredServicesByProvider();

    
    return (
      <Accordion>

        {this.renderProviders(filteredProviders)}
      </Accordion>
    );
  }
}

ProviderRoles.protoTypes = {
  servicesByProvider: PropTypes.object,
  /**
   * addedProviderTypes: Array of pro
   */
  addedProviderTypes:  PropTypes.arrayOf(
    
  )
}

// function mapStateToProps(state) {
//   return {
//     defaultModel: state.defaultModel,
//   }
// }

export default ProviderRoles;