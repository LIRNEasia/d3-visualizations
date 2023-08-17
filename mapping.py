from dash import Dash, dcc, html, Input, Output
import plotly.express as px
import pandas as pd
import geopandas as gpd

gdf = pd.read_csv('https://raw.githubusercontent.com/LIRNEasia/d3-visualizations/master/resources/complete_data.csv')

geo_json = gpd.read_file("https://raw.githubusercontent.com/LIRNEasia/d3-visualizations/master/resources/dsd_topology.json")


geo_df = geo_json.merge(gdf, on="code_4").set_index('dsd_name_x')

app = Dash(__name__)


app.layout = html.Div([
    html.H4('Choropleth map of Sri Lanka based on ASWSUM data'),
    html.P("Poverty category:"),
    dcc.RadioItems(
        id='candidate',
        options=["Severely Poor", "Poor",  "Transient", "Vulnerable"],
        value="Poor",
        inline=True
    ),
    dcc.Graph(id="graph"),
])


@app.callback(
    Output("graph", "figure"),
    Input("candidate", "value"))
def display_choropleth(candidate):

    fig = px.choropleth(geo_df,
                   geojson=geo_df.geometry,
                   color= candidate,
                   locations=geo_df.index,
                   #featureidkey= geo_df.index,
                   projection="mercator",range_color=[0, 6500])
    fig.update_geos(fitbounds="locations", visible=False)
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    return fig



app.run_server(host='0.0.0.0', port=8050)