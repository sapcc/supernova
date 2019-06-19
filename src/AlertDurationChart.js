import React, { PureComponent } from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, LabelList, Cell
} from 'recharts';
import moment from 'moment'

//const data = [
//    {
//          name: 'Page A', uv: 590, pv: [100,800], amt: 1400,
//        },
//    {
//          name: 'Page B', uv: 868, pv: 967, amt: 1506,
//        },
//    {
//          name: 'Page C', uv: 1397, pv: 1098, amt: 989,
//        },
//    {
//          name: 'Page D', uv: 1480, pv: 1200, amt: 1228,
//        },
//    {
//          name: 'Page E', uv: 1520, pv: 1108, amt: 1100,
//        },
//    {
//          name: 'Page F', uv: 1400, pv: 680, amt: 1700,
//        },
//];

export default class Example extends PureComponent {
  
  render() {
    const startItem = this.props.alerts.reduce((lastDate,alert) => lastDate>moment(alert.startsAt) ? moment(alert.startsAt) : lastDate, moment())
    const offset = startItem ? startItem.valueOf() : Date.now()
    if(startItem) console.log('::::START::::',startItem.valueOf())
    const data = this.props.alerts.map(alert => {
      const start = moment(alert.startsAt)
      const end = moment(alert.endsAt)

      return {
        name: alert.annotations.summary, 
        duration: [((start.valueOf()-offset)), ((end.valueOf()-offset))],

        label: [start.format('DD.MM.YYYY HH:mm'),end.format('DD.MM.YYYY HH:mm')],
        color: this.props.colors[alert.labels.severity]
      }
    })
    
    let tickCount = moment(Date.now()).diff(offset, 'days')
    if(tickCount < 1) tickCount = 2

    return (
      <ComposedChart
        layout="vertical"
        width={this.props.width-100}
        height={500}
        data={data}
        margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                    }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="number" interval='preserveStartEnd' tickFormatter={(a) => moment(a+offset).format('DD.MM.YYYY HH:mm')} minTickGap={2} tickCount={tickCount} />
        <YAxis dataKey="name" type="category" hide={true}/>
        <Tooltip labelFormatter={label => label} formatter={(value, name, props) => `${props.payload.label[0]} - ${props.payload.label[1]}`}/>
        <Legend />
        <Bar dataKey="duration" barSize={20} >
          {
            data.map((item,index) => 
              <Cell fill={item.color} key={index}/>
            )
          }
        </Bar> 
      </ComposedChart>
    );
  }
}
