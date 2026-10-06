# Avatar manga de Poder Fitness

Arte original para la app. El centro es un hombre anime que se transforma con el rango. Las viñetas y las onomatopeyas son un acento: no tapan el cuerpo ni el aura.

No usa personajes, nombres, logos, peinados-firma ni sonidos de ninguna serie. El parecido con el shonen es de lenguaje (sombreado por celdas, tinta, pose, pelo de pinchos), no de copia.

## Personaje

Avatar del usuario, hombre por defecto. No tiene nombre de franquicia.

La cara no cambia:

- Piel canela, óvalo largo, ojos ámbar con el rabillo un poco caído.
- Ceja izquierda con una muesca. Tres pecas en el puente de la nariz.
- Un aro triangular plateado solo en la oreja izquierda.

El pelo es una cresta asimétrica de cinco pinchos, barrida hacia su derecha. El segundo pincho desde su izquierda es el más alto. Dos mechones de mejilla se curvan hacia dentro. Esa silueta se alarga o se encrespa, pero no se sustituye por otro peinado.

Ropa fija: sudadera sin mangas carbón, forro naranja, pantalón de entreno por la pantorrilla, vendas claras, zapatillas negras con una raya naranja, chevron pequeño en el pecho. Sin gi, capa, armadura ni cinta.

## Cómo crece

Misma cara. Cambian el pelo, el tamaño y el color del aura, y el músculo. Desde Tormenta hay rayos alrededor, nunca encima de la cara.

| Id | Nombre | Pelo | Aura | Cuerpo |
| --- | --- | --- | --- | --- |
| `chispa` | Chispa | Corto, azul marino, puntas hielo | Chispa pequeña, `#9FD4FF` | Delgado |
| `brasa` | Brasa | Oscuro, puntas brasa | Brasa corta, `#FF6A1A` | Algo más de hombro |
| `llama` | Llama | Naranja con filo dorado | Llama media, `#FF4D00` | Atleta definido |
| `incendio` | Incendio | Rojo y amarillo, más largo | Fuego grande, `#FF2D00` | Más ancho |
| `tormenta` | Tormenta | Índigo y blanco | Azul, `#7AA2FF`, primeros rayos | Más marcado |
| `relampago` | Relámpago | Cian, pinchos más finos | Cian, `#5CE1FF`, varios rayos | Muy definido |
| `nova` | Nova | Oro y blanco | Estallido dorado, `#FFC53D` | Heroico |
| `eclipse` | Eclipse | Negro con filo de oro | Corona dorada | Muy muscular |
| `mitico` | Mítico | Azul y oro | Aura doble, oro y `#9EBEFF` | Máximo, con rayos |
| `absoluto` | Absoluto | Blanco y oro, controlado | Halo claro, `#FFF8E8` | Cima, en calma |

Los archivos sueltos están en `avatar/male/{id}.png`. La hoja es `avatar/rank-sheet.png`.

Poses en rango Llama, en `avatar/male/poses/`: `idle`, `entrenando`, `victoria`, `cargando`. `transformacion` es el fotograma del salto, con el pelo levantado y el flash.

## Paleta

Fondos de la app: `#07080D`, tarjeta `#171C28`, texto `#F4F1EA`, texto secundario `#9AA3B5`. El naranja `#FF6A1A` es acción (Empezar, Hoy activo). El color de rango pinta el aura y la pastilla del nombre, no grandes paneles.

## Tipografía

| Uso | Familia |
| --- | --- |
| Nivel, nombre de rango, onomatopeya | Archivo Black |
| Interfaz | Outfit |
| Lettering de rango | Archivo Black, blanco, trazo negro |

El nombre de rango va en mayúsculas. En la transformación, «LLAMA» queda debajo del cuerpo, no cruzándolo.

## Onomatopeyas

Acento, en español, fuera de la cara: «¡ZAS!», «¡BOOM!», «DOOON». Una caja corta de narración, «¡Tu poder aumenta!», puede sentarse en el hueco entre el avatar y la sesión. No hay trama de puntos, ni marco de viñeta cerrando al personaje, ni un titular que lo tape.

## Reduced motion

Con `prefers-reduced-motion: reduce` no hay flash, líneas de velocidad ni sacudida. El rango destino aparece quieto, con su aura fija y sin pulso. La onomatopeya puede quedarse como texto estático o omitirse. La frase del rango no cambia: «Tu nivel de poder entra en Llama.»

## Pantallas

Las tres piezas son 390×844. Siguen siendo la app de entreno.

| Archivo | Qué se ve |
| --- | --- |
| `mockups/hoy.png` | Rango Llama, nivel 18, cuerpo y aura, sesión Empuje y Reto del héroe |
| `mockups/reproductor-impacto.png` | Press militar, serie completa, el avatar con la barra, «¡ZAS!» y un flash |
| `mockups/transformacion.png` | Salto de Brasa a Llama: aura, pelo, flash y el nombre del rango |

## Variante femenina

Hueco. No hay lámina a medias. Cuando se dibuje, será la misma transformación (pelo, aura, músculo, rayos en los rangos altos) y las mismas marcas de cara adaptadas, no otro personaje genérico.
