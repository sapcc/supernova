import React, { PureComponent } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar
} from 'recharts';

//const data = [
//  {
//    name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
//  },
//  {
//    name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
//  },
//  {
//    name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
//  },
//  {
//    name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
//  },
//  {
//    name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
//  },
//  {
//    name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
//  },
//  {
//    name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
//  },
//];

export default class Alerts extends PureComponent {
  date = (alert) => {
    const d = new Date(alert.startsAt)
    return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`
  }

  toData = (alerts) => {
    const map = {}
    alerts.forEach(alert => {
      const date = this.date(alert)
      map[date] = map[date] || {}
      map[date][alert.labels.severity] = map[date][alert.labels.severity] || 0
      map[date][alert.labels.severity] += 1
    })

    return Object.keys(map).map(date => ({ ...map[date], name: date}) )
  }

  render() {
    if(!this.props.alerts || this.props.alerts.length === 0) return null
    const alerts = this.props.alerts.slice()
    alerts.sort((a,b) => {
      if(a.startsAt < b.startsAt) return -1
      if(a.startsAt > b.startsAt) return 1
      return 0
    })
    const data = this.toData(alerts)
    const criticalColor = this.props.colors.critical || '#E74C3C'
    const warningColor = this.props.colors.warning || '#F39C12'
    const infoColor = this.props.colors.info || '#3498DB'

    return (
      <React.Fragment>
        { /*
        <LineChart
          width={window.innerWidth}
          height={300}
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="critical" stroke={criticalColor} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="warning" stroke={warningColor} />
          <Line type="monotone" dataKey="info" stroke={infoColor} />
        </LineChart>
        */}
        <BarChart
          width={this.props.width}
          height={300}
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} formatter={(value, entry, index) => 
              `${value} (${alerts.filter(alert => alert.labels.severity === value).length})`
          }/> 
          <Bar dataKey="critical" stackId="a" fill={criticalColor} />
          <Bar dataKey="warning" stackId="a" fill={warningColor} />
          <Bar dataKey="info" stackId="a" fill={infoColor} />
        </BarChart>
      </React.Fragment> 
    );
  }
}

