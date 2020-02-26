// Please implement your solution in this file
import axios from 'axios';
import { get } from 'lodash';

const SELECTED_YEAR = '2018';
const SELECTED_CUSTOMER = 'NASA';

function fetchData() {
  axios.get("https://api.spacexdata.com/v3/launches/past")
    .then(response => renderData(prepareData(response.data)))
    .catch(error => console.log(error));
};

function filterData(items) {
  if (items.length) {
    return items.reduce((arr, item) => {
      get(item, 'launch_year') === SELECTED_YEAR && get(item, 'rocket.second_stage.payloads', []).map(payload => {
        const { customers } = payload;

        return customers.map(customer => {
          if (customer.includes(SELECTED_CUSTOMER)) {
            arr.push(item);
          }
        })
      });

      return arr;
    }, []);
  }
  return [];
};

const sortData = arr => arr.sort((prevItem, nextItem) => {
  const prevPayload = prevItem.rocket.second_stage.payloads.length;
  const nextPayload = nextItem.rocket.second_stage.payloads.length;
  const prevTime = new Date(prevItem.launch_date_utc);
  const nextTime = new Date(nextItem.launch_date_utc);

  if(prevPayload > nextPayload) return -1;
  if(prevPayload < nextPayload) return 1;
  if(prevTime > nextTime) return -1;
  if(prevTime < nextTime) return 1;

  return 0;
});

const prepareData = response => sortData(filterData(response)).map(item => ({
  flight_number: item.flight_number,
  mission_name: item.mission_name,
  payloads_count: get(item, 'rocket.second_stage.payloads').length
}));

const renderData = result => document.getElementById('out').innerHTML = JSON.stringify(result, undefined, 2);

module.exports = {
  prepareData,
  renderData,
  fetchData
};
