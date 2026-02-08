export const reIndex = new RegExp('^\\d{2}_', '');

export function ampEncodeURI(uri: string): string
{
    var uriEncoded = encodeURI(uri)
    // console.log('uri:' + uri);
    // console.log('uriEncoded:' + uriEncoded);

    uriEncoded = uriEncoded.replace(/'/g, '%27');
    uriEncoded = uriEncoded.replace(/&/g, '%26');
    uriEncoded = uriEncoded.replace(/#/g, '%23');
    // European
    // encodeURI uses e%CC%80 for french e backtick for example, re-encode this.
    uriEncoded = uriEncoded.replace(/é/g, '%C3%A9');
    // uriEncoded = uriEncoded.replace(/à/g, '%C3%A0');
    uriEncoded = uriEncoded.replace(/a%CC%80/g, '%C3%A0');
    // uriEncoded = uriEncoded.replace(/è/g, '%C3%A8');
    uriEncoded = uriEncoded.replace(/e%CC%80/g, '%C3%A8');
    // Forward Accented
    uriEncoded = uriEncoded.replace(/e%CC%81/g, '%C3%A9');
    uriEncoded = uriEncoded.replace(/E%CC%81/g, '%C3%89');
    uriEncoded = uriEncoded.replace(/a%CC%81/g, '%C3%A1');
    uriEncoded = uriEncoded.replace(/o%CC%81/g, '%C3%B3');
    uriEncoded = uriEncoded.replace(/A%CC%81/g, '%C3%81');
    uriEncoded = uriEncoded.replace(/u%CC%81/g, '%C3%BA');
    uriEncoded = uriEncoded.replace(/I%CC%81/g, '%C3%8D');
    uriEncoded = uriEncoded.replace(/U%CC%81/g, '%C3%9A');

    // Back accented
    uriEncoded = uriEncoded.replace(/A%CC%80/g, '%C3%80');
    uriEncoded = uriEncoded.replace(/o%CC%80/g, '%C3%B2');
    uriEncoded = uriEncoded.replace(/E%CC%80/g, '%C3%88');
    uriEncoded = uriEncoded.replace(/i%CC%80/g, '%C3%AC');
    uriEncoded = uriEncoded.replace(/u%CC%80/g, '%C3%B9');

    // Signalefa
    uriEncoded = uriEncoded.replace(/a%CC%83/g, '%C3%A3');
    uriEncoded = uriEncoded.replace(/n%CC%83/g, '%C3%B1');

    uriEncoded = uriEncoded.replace(/c%CC%A7/g, '%C3%A7');
    uriEncoded = uriEncoded.replace(/o%CC%82/g, '%C3%B4');
    uriEncoded = uriEncoded.replace(/C%CC%A7/g, '%C3%87');
    uriEncoded = uriEncoded.replace(/e%CC%82/g, '%C3%AA');
    uriEncoded = uriEncoded.replace(/a%CC%82/g, '%C3%A2');
    // Umlauts
    uriEncoded = uriEncoded.replace(/e%CC%88/g, '%C3%AB');
    uriEncoded = uriEncoded.replace(/u%CC%88/g, '%C3%BC');
    uriEncoded = uriEncoded.replace(/o%CC%88/g, '%C3%B6');
    uriEncoded = uriEncoded.replace(/a%CC%88/g, '%C3%A4');
    uriEncoded = uriEncoded.replace(/A%CC%88/g, '%C3%84');
    uriEncoded = uriEncoded.replace(/O%CC%88/g, '%C3%96');
    uriEncoded = uriEncoded.replace(/U%CC%88/g, '%C3%9C');

    // console.log('uriEncoded:' + uriEncoded);
    return uriEncoded;

}
