import pandas as pd
import numpy as np
import pyarrow as py

pd.options.display.float_format = "{:,}".format
path_entrada = "/Users/..."
path_saida = "/Users/....."

# Grupos econômicos
grupos_econ = pd.read_csv(
    rf"{path_entrada}/Ses_grupos_economicos.csv",
    delimiter=";",
    encoding="latin-1",
    dtype={"coenti": str, "cogrupo": str},
)
grupos_econ["damesano"] = pd.to_numeric(grupos_econ["damesano"], errors="coerce")
grupos_econ_limpo = grupos_econ.rename(
    columns={
        "damesano": "periodo",
        "coenti": "codigo_entidade",
        "nogrupo": "nome_grupo_econ",
        "noenti": "nome_entidade",
        "cogrupo": "codigo_grupo_econ",
    }
)
grupos_econ_limpo["periodo"] = pd.to_datetime(
    grupos_econ_limpo["periodo"], format="%Y%m", errors="coerce"
)
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].str.capitalize()
grupos_econ_limpo["nome_grupo_econ"] = grupos_econ_limpo[
    "nome_grupo_econ"
].str.capitalize()
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].map(
    lambda x: str(x).strip()
)
grupos_econ_limpo["codigo_entidade"] = grupos_econ_limpo["codigo_entidade"].map(
    lambda x: str(x).strip()
)
grupos_econ_limpo["nome_grupo_econ"] = grupos_econ_limpo["nome_grupo_econ"].map(
    lambda x: str(x).strip()
)
grupos_econ_limpo["codigo_grupo_econ"] = grupos_econ_limpo["codigo_grupo_econ"].map(
    lambda x: str(x).strip()
)

# Tratando exceções
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].replace(
    "Angelus seguros s/a.", "Angelus seguros sa"
)
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].replace(
    "Evidence previdência s.a.", "Evidence previdência"
)
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].replace(
    "Porto seguro capitalização s/a", "Porto seguro capitalização s.a."
)
grupos_econ_limpo["nome_entidade"] = grupos_econ_limpo["nome_entidade"].replace(
    "Axa corporate solutions brasil e américa latina resseguros s.a.",
    "Axa xl resseguros s.a.",
)

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

# Base seguros UF
main = pd.read_csv(
    rf"{path_entrada}/Ses_UF2.csv",
    delimiter=";",
    decimal=",",
    dtype={"coramo": str, "coenti": str, "ramos": str},
    low_memory=False,
)
main_sanitized = main[main["damesano"] >= 201401]  # DATA A ESCOLHER
main_sanitized = main_sanitized.rename(
    columns={
        "damesano": "periodo",
        "coenti": "codigo_entidade",
        "ramos": "codigo_ramo",
        "gracodigo": "codigo_grupo",
        "UF": "uf",
    }
)
main_sanitized["periodo"] = pd.to_datetime(
    main_sanitized["periodo"], format="%Y%m", errors="coerce"
)
main_sanitized["codigo_entidade"] = main_sanitized["codigo_entidade"].map(
    lambda x: str(x).strip()
)
main_sanitized["codigo_ramo"] = main_sanitized["codigo_ramo"].map(
    lambda x: str(x).strip()
)
main_sanitized["codigo_grupo"] = main_sanitized["codigo_grupo"].map(
    lambda x: str(x).strip()
)
main_sanitized = main_sanitized.fillna(0)
main_sanitized = main_sanitized.replace(np.nan, 0)

# Resumo geral seguros
resumo = main_sanitized.merge(ramos_com_grupos, on=["codigo_ramo"], how="left")
resumo_cias = resumo.merge(
    grupos_econ_limpo, on=["codigo_entidade", "periodo"], how="left"
)
resumo_final = resumo_cias.sort_index(axis=1)


# Tratamento exceções
resumo_final.loc[
    resumo_final["codigo_entidade"] == "03387", "nome_entidade"
] = "Angelus seguros sa"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "03387", "nome_grupo_econ"
] = "Independent"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "03387", "codigo_grupo_econ"
] = "01225"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "17400", "nome_entidade"
] = "Evidence previdência"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "17400", "nome_grupo_econ"
] = "Santander"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "17400", "codigo_grupo_econ"
] = "01200"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "05118", "nome_grupo_econ"
] = "Sul america"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "05118", "codigo_grupo_econ"
] = "00019"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "28878", "nome_entidade"
] = "Porto seguro capitalização s.a."
resumo_final.loc[
    resumo_final["codigo_entidade"] == "28878", "nome_grupo_econ"
] = "Porto seguro"
resumo_final.loc[
    resumo_final["codigo_entidade"] == "28878", "codigo_grupo_econ"
] = "00051"
resumo_final["nome_grupo_ramo"] = resumo_final["nome_grupo_ramo"].str.strip()
resumo_final["nome_grupo_ramo"] = resumo_final["nome_grupo_ramo"].str.capitalize()
resumo_final["nome_ramo"] = resumo_final["nome_ramo"].str.strip()
resumo_final["nome_ramo"] = resumo_final["nome_ramo"].str.capitalize()
resumo_final["periodo"] = pd.to_datetime(resumo_final["periodo"]).dt.date

base_premio = resumo_final[
    [
        "nome_entidade",
        "nome_grupo_econ",
        "nome_grupo_ramo",
        "nome_ramo",
        "periodo",
        "premio_dir",
        "uf",
    ]
]

base_premio.loc[:, "periodo"] = pd.to_datetime(
    base_premio["periodo"], format="%Y-%m-%d"
)

base_premio.to_json(
    rf"{path_saida}/base_premio_uf.json", orient="records", date_format="iso", indent=4
)
