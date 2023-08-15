import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import geopandas as gpd
import pandas as pd


gdf = pd.read_csv('resources/complete_data.csv')

geo_json = gpd.read_file("resources/dsd_topology.json")


app = dash.Dash(__name__)

app.layout = html.Div(
    className="container",
    children=[
        html.H1("ASWSM DATA", className="title"),
        html.P("Poverty Category:", className="subtitle"),
        dcc.RadioItems(
            id="candidate",
            options=[
                {"label": "Poor", "value": "Poor"},
                {"label": "Severely Poor", "value": "Severely Poor"},
                {"label": "Transient", "value": "Transient"},
                {"label": "Vulnerable", "value": "Vulnerable"},
            ],
            value="Poor",
            className="radio-items",
        ),
        dcc.Graph(id="graph", className="graph"),
    ],
)

if __name__ == "__main__":
    @app.callback(
    Output("graph", "figure"),
    Input("candidate", "value"))
    def display_choropleth(candidate):

        fig = px.choropleth(geo_df,
                   geojson=geo_df.geometry,
                   color= candidate,
                   locations=geo_df.index,
                   #featureidkey= geo_df.index,
                   projection="mercator",range_color=[0, 15000])
        fig.update_geos(fitbounds="locations", visible=False)
        fig.update_geos(fitbounds="locations", visible=False)
        fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
        return fig



app.run_server(debug=True)
