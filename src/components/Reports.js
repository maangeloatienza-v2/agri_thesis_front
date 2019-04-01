import React, { Component } from 'react'
import { withRouter, NavLink } from 'react-router-dom' 
import { Row, Col, Button } from 'reactstrap'
import { TOAST, DATE, gDp } from '../helpers/helpers'

import * as API from '../services/API'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import moment from 'moment';
import Loader from './Loader'

import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {FaCalendar} from 'react-icons/fa/'
import 'bootstrap-daterangepicker/daterangepicker.css';

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
const qs = require('query-string');
class Reports extends Component {
    urlSearch = qs.parse(this.props.history.location.search)
    state = {
        data:[],
        report:[],
        isLoading: true,
        average_report: [],
        report_name: '',
        pageState: {
            start_date: this.urlSearch.start_date,
            end_date: this.urlSearch.end_date
        },
    }

    fetchData = (id,is_average=false) => {
        if(id){
            this.getReport(id)
        } else if(this.props.apiRoute==='getAnnualReport'){
            this.getAnnual()
        } else {
            this.getAverage()
        }
    }

    getReport = (id) => {
        const st = this.state
        this.setState({isLoading: true})
        const params = {
            start_date: st.pageState.start_date || '',
            end_date: st.pageState.end_date || ''
        }
        !st.pageState.start_date && delete params.start_date
        !st.pageState.end_date && delete params.end_date
        API.getReport(params,id)
        .then((response)=>{
            this.setState({report: response.data})
        }, err => {
            TOAST.pop({report: [], message: err.message, type: 'error'})
        }).finally(()=> 
            this.setState({isLoading: false})
        )
    }

    getAnnual = () => {
        const st = this.state
        this.setState({isLoading: true})
        API.getAnnualReport()
        .then((response)=>{
            const report = response.data.map((months)=> {return {...months, Month: month[months.Month-1]}})
            this.setState({annual_report: report})
        }, err => {
            TOAST.pop({annual_report:[], message: err.message, type: 'error'})
        }).finally(()=> 
            this.setState({isLoading: false})
        )
    }

    getAverage = () => {
        const st = this.state
        this.setState({isLoading: true})
        const params = {
            start_date: st.pageState.start_date || '',
            end_date: st.pageState.end_date || ''
        }
        // !st.pageState.start_date && delete params.start_date
        // !st.pageState.end_date && delete params.end_date
        API.getAverageReports(params)
        .then((response)=>{
            const report = [{...response.data,
                fw1: response.data.avg_fw1, bw1: response.data.avg_bw1,
                fw2: response.data.avg_fw2, bw2: response.data.avg_bw2,
                fw3: response.data.avg_fw3, bw3: response.data.avg_bw3,
                fw4: response.data.avg_fw4, bw4: response.data.avg_bw4,
                fw5: response.data.avg_fw5, bw5: response.data.avg_bw5,
                fw6: response.data.avg_fw6, bw6: response.data.avg_bw6,
                fw7: response.data.avg_fw7, bw7: response.data.avg_bw7,
                fw8: response.data.avg_fw8, bw8: response.data.avg_bw8,
            }]
            this.setState({report: report})
        }, err => {
            TOAST.pop({report: [],message: err.message, type: 'error'})
        }).finally(()=> 
            this.setState({isLoading: false})
        )
    }

    componentDidMount = () => {
        const {id} = this.props.match.params
        this.setState({isLoading: true})
        API.getReports()
        .then((response)=>{
            const newData = response.data.filter((report,index,self)=>
                index === self.findIndex((t) => (
                t.activity_id === report.activity_id
              ))
            )
            this.setState({data: newData})
            // this.setState({data: response.data})
        }, err => {
            TOAST.pop({message: err.message, type: 'error'})
        }).finally(()=> {
            this.setState({isLoading: false})
            this.fetchData(id)
        })
    }

    componentWillReceiveProps = (newProps) => {
        const {id} = newProps.match.params
        console.log(newProps)
        this.setState({isLoading: true})
        if(newProps.location.pathname==='/reports') {
            this.getAverage()
        } else if(newProps.location.pathname==='/report/annual') {
            this.getAnnual()
        } else{
            this.getReport(id)
        }
    }

    handleDateRange = (event, picker) => {
        const that = this
        const st = this.state
        const {id} = this.props.match.params
        this.setState({
            pageState: {
                start_date: picker.startDate.format(DATE.DATE_DASH),
                end_date: picker.endDate.format(DATE.DATE_DASH)
            }
            },()=> {
                this.props.history.push(`?start_date=${picker.startDate.format(DATE.DATE_DASH)}&end_date=${picker.endDate.format(DATE.DATE_DASH)}`)
                if(id){
                    this.fetchData(id, picker.startDate.format(DATE.DATE_DASH))
                } else {
                    this.fetchData('', true)
                }
            })
    }

    render() {
        const st= this.state
        const pr = this.props
        const {id} = this.props.match.params
        const startDate = gDp(st.pageState,'start_date') ? moment(gDp(st.pageState,'start_date'),DATE.DATE_DASH) : ''
        const endDate = gDp(st.pageState,'end_date') ? moment(gDp(st.pageState,'end_date'),DATE.DATE_DASH) : ''
        const emptyDateCond = startDate==='' && endDate ===''
        const is_annual = !!this.props.apiRoute
        const newParams = st.pageState.start_date ? `?start_date=${st.pageState.start_date}&end_date=${st.pageState.end_date}` : ''
        const reports = []
        st.data.map((report, pos)=> 
            reports.push(
            <Button key={report.id} color={id===report.activity_id ? "primary" : "secondary"} style={{width: '100%', marginBottom: '5px'}}
                onClick={()=>{
                    console.log(report)
                    this.setState({report_name: report.name})
                    pr.history.push(`/report/${report.activity_id}${newParams}`)}}>
                {report.name}
            </Button>
        ))
        const data = st.report.length ? [
            {
                name: 1, fw: st.report[0].fw1, bw: st.report[0].bw1
            },
            {
                name: 2, fw: st.report[0].fw2, bw: st.report[0].bw2
            },
            {
                name: 3, fw: st.report[0].fw3, bw: st.report[0].bw3
            },
            {
                name: 4, fw: st.report[0].fw4, bw: st.report[0].bw4
            },
            {
                name: 5, fw: st.report[0].fw5, bw: st.report[0].bw5
            },
            {
                name: 6, fw: st.report[0].fw6, bw: st.report[0].bw6
            },
            {
                name: 7, fw: st.report[0].fw7, bw: st.report[0].bw7
            },
            {
                name: 8, fw: st.report[0].fw8, bw: st.report[0].bw8
            },
        ] : ''

        const params = st.pageState.start_date ? `?start_date=${st.pageState.start_date}&end_date=${st.pageState.end_date}` : ''
        const date = new Date()
        const year = date.getFullYear()
        const Month = date.getMonth()
        
        let selections = {}
        for(var a=0; a<=Month; a++){
            const lastDay = moment(new Date(date.getFullYear(), month[a+1] , 0)).format('DD');
            selections[month[a]] = [moment().startOf(month[a]), moment().endOf(month[a])]
        }
        console.log(st.annual_report)
        const report_name = pr.location.pathname==='/reports' ? 'Average' :
                            pr.location.pathname==='/report/annual' ? 'Annual' : 
                            st.report_name
        return (
            <div style={{margin: '0 5% 15px'}}> 
                <Row>
                    <Col sm="12" md="3" style={{overflowY:'auto', background: 'white', marginBottom: '10px', border: '2px solid #014401', borderRadius: '5px', paddingTop: '10px'}} className="report-buttons">
                    <Button color={!id && pr.apiRoute ? "primary" : "secondary"} style={{width: '100%', marginBottom: '5px'}}
                        onClick={()=>pr.history.push(`/report/annual${newParams}`)}>
                        Annual Report
                    </Button>
                    <Button color={!id && !pr.apiRoute ? "primary" : "secondary"} style={{width: '100%', marginBottom: '5px'}}
                        onClick={()=>pr.history.push(`/reports${newParams}`)}>
                        Average Report
                    </Button>
                        <div>Select Report: </div>
                        {reports}
                    </Col>
                    <Col sm="12" md="9">
                        <Row>
                            <Col sm="12" md="4" lg="3" style={{padding: '0', marginBottom: '10px'}}>
                                <div>
                                    <div className="react-date-range-picker">
                                        <DateRangePicker
                                            // opens="left"
                                            {...(startDate) ? {startDate} : {}}
                                            {...(endDate) ? {endDate} : {}}
                                            ranges={selections}
                                            onApply={this.handleDateRange}
                                            >
                                            <div>
                                                <Button type="button" className="pad-0 react-date-range-input" size='sm' color="link">
                                                    <i className="btn-icon">
                                                        <FaCalendar/>&nbsp;
                                                    </i>
                                                    {
                                                        emptyDateCond ? (
                                                            <span>All</span>
                                                        ) :
                                                        (
                                                            <span>
                                                                <span>{`${startDate.format("MMMM")}`}</span>
                                                            </span>

                                                        )
                                                    }
                                                </Button>
                                            </div>
                                        </DateRangePicker>
                                        {/* <Button style={{top:'-2px', right:'5px'}} size="sm" className="form-control-sm-font-size remove" color="link" onClick={(e)=>{
                                            this.setState({
                                                pageState: {
                                                    start_date: '',end_date: ''
                                                }
                                            })
                                            }
                                        }
                                        >
                                            <strong> X </strong>
                                        </Button> */}
                                    </div>
                                </div>
                            </Col>
                            <Col align="right" style={{paddingRight: '0'}}>
                                <Button color="success" style={{padding: '0 30px'}} onClick={()=>window.open(`/report/print/${id? id: pr.apiRoute? 'annual': 'average'}${params}`)}>
                                    Print Report
                                </Button>
                            </Col>
                        </Row>
                        
                        <div style={{position:'relative'}}>
                            <div style={{position:'absolute', top: '20px', width: '100%', fontWeight:'bold'}} align="center">{report_name} Report for the month of {startDate.format("MMMM")}</div>
                            {is_annual ? 

                            <ResponsiveContainer>
                                <BarChart
                                    // width={800}
                                    // height={300}
                                    data={st.annual_report}
                                    margin={{
                                    top: 30, right: 15, left: 5, bottom: 15,
                                    }}
                                >
                                    <XAxis dataKey="Month" tickSize
                                        dy='25'/>
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar name="Fresh Weight Test" dataKey="avg_fw" fill="#82ca9d"/>
                                    <Bar name="Dry Weight Test" dataKey="avg_bw" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>:
    
                            <ResponsiveContainer>
                                <BarChart
                                    // width={800}
                                    // height={300}
                                    data={data}
                                    margin={{
                                    top: 30, right: 15, left: 5, bottom: 15,
                                    }}
                                >
                                    <XAxis dataKey="name" tickSize
                                        dy='25'/>
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar name="Fresh Weight Test" dataKey="fw" fill="#82ca9d"/>
                                    <Bar name="Dry Weight Test" dataKey="bw" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                            }
                        </div>
                    </Col>
                </Row>
                
                <Loader
                    message={(
                        <div>
                            {/* <h4>Fetching reports</h4> */}
                            <p>Loading...</p>
                        </div>
                    )}
                    isLoading={st.isLoading || false}
                />
            </div>
        ) ;
    }
}

export default withRouter(Reports);