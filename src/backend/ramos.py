import pandas as pd
import numpy as np
import pyarrow as py

pd.options.display.float_format = "{:,}".format
path_entrada = "/Users/..."
path_saida = "/Users/....."

# Grupos de seguros
grupos_ramos = pd.read_csv(
    rf"{path_entrada}/Ses_gruposramos.csv",
    delimiter=";",
    encoding="latin-1",
    dtype={"GRACODIGO": str},
)
grupos_ramos_limpo = grupos_ramos.rename(
    columns={
        "GRAID": "id_grupo_ramo",
        "GRANOME": "nome_grupo_ramo",
        "GRACODIGO": "codigo_grupo_ramo",
    }
)
grupos_ramos_limpo["nome_grupo_ramo"] = grupos_ramos_limpo["nome_grupo_ramo"].str.slice(
    start=5
)
grupos_ramos_limpo["nome_grupo_ramo"] = grupos_ramos_limpo[
    "nome_grupo_ramo"
].str.capitalize()

# Ramos de seguro
ramos = pd.read_csv(
    rf"{path_entrada}/Ses_ramos.csv",
    delimiter=";",
    encoding="latin-1",
    dtype={"coramo": str},
)
ramos["codigo_grupo_ramo"] = ramos["coramo"].map(
    lambda x: str(x)[:2]
)  # extraindo numero do grupo
ramos_limpo = ramos.rename(columns={"coramo": "codigo_ramo", "noramo": "nome_ramo"})
ramos_limpo["nome_ramo"] = ramos_limpo["nome_ramo"].str.slice(start=7)
ramos_limpo["nome_ramo"] = ramos_limpo["nome_ramo"].str.capitalize()

# Ramos + Grupos
ramos_com_grupos = pd.merge(
    ramos_limpo,
    grupos_ramos_limpo,
    how="inner",
    left_on="codigo_grupo_ramo",
    right_on="codigo_grupo_ramo",
)
ramos_com_grupos.codigo_grupo_ramo = ramos_com_grupos.codigo_grupo_ramo.map(
    lambda x: x.strip()
)
ramos_com_grupos.codigo_ramo = ramos_com_grupos.codigo_ramo.map(lambda x: x.strip())
ramos_com_grupos = ramos_com_grupos.drop(ramos_com_grupos.columns[3], axis=1)
