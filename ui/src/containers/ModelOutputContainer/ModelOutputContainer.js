import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types'

import ViewHeader from '../../components/ViewHeader';
import ViewSection from '../../components/ViewSection';
import ViewContainer from '../../components/ViewContainer';
import ViewFooter from '../../components/ViewFooter';
import Panel from '../../components/Panel';
import ProviderRoles from '../../modules/ProviderRoles';

import { SET_MODEL_GEO_FILTER } from '../../actions';



class ModelOutputContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modifiedModelAttributes: {},
      filteredModelOutput: {},
      filtersApplied: false,
      modelParamsEdited: false,
    }

    this.handleFilterUpdate = this.handleFilterUpdate.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('new State', nextState)
  }

  updateModelAttributes = (currentServiceAttrs) => {
    console.log('currentServiceAttrs', currentServiceAttrs)
    this.setState({  
      modifiedModelAttributes: {...this.state.modifiedModelAttributes, currentServiceAttrs},
      modelParamsEdited: true,
    })
  }

  handleFilterUpdate(filters) {
    this.setState(filters)

    this.props.setModelGeoFilter(filters)
  }
  
  render() {
    console.log(this.props.currentModelOutput.servicesByProvider)
    let { servicesByProvider } = this.props.currentModelOutput;
    // let filtersCount = Object.keys(this.props.selectedFilters).length;
    let { modelParamsEdited} = this.state.filtersApplied;

    return (
      <>
        <ViewContainer>
          <ViewHeader />
          <div className="view-body">
            <ViewSection 
              updateModelAttributes={this.updateModelAttributes} title="">
              <ProviderRoles
                activeFilters={this.props.modelFilters.activeFilters}
                servicesByProvider={servicesByProvider}
                updateModelAttributes={this.updateModelAttributes} />
            </ViewSection>
          </div>

          {modelParamsEdited ?
            <ViewFooter>
              <p>{`You've changed some model params!` }</p>
            </ViewFooter> 
            : null }
        </ViewContainer>
        <Panel modelFilters={this.props.modelFilters} handleFilterUpdate={this.handleFilterUpdate}/>
      </>
    );
  }

};

ModelOutputContainer.defaultProps = {
  modelOutput: {},
  selectedFilters: {
    geography: 'a',
    provider: 'phys',
  },
};

ModelOutputContainer.propTypes = {
  modelOutput: PropTypes.object.isRequired,
  selectedFilters: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    currentModelOutput: state.currentModelOutput,
    modelFilters: state.modelFilters,
  }
};


/**
 * mapStateToDispatch()
 * 
 * action creators that will need to be dispatched to the store
 * these actions ultimately update the redux store, and if an async
 * call needs to be made to the API, that will be handeled by a saga.
 * The result of the saga will be passed to the action when the saga
 * calls it with a put()
 * 
 * Sagas live in `/ui/src/sagas`
 */
const mapDispatchToProps = dispatch => {
  return {
    setModelGeoFilter: (newFilter) => dispatch({ type: SET_MODEL_GEO_FILTER, payload: newFilter })
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ModelOutputContainer);