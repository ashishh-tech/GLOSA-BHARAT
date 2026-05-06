import base64

print('='*60)
print('ALL POSSIBLE INTERPRETATIONS')
print('='*60)

b64 = 'MTMyLjQ1NTMgRQ=='
lon = base64.b64decode(b64).decode()
print(f'Clue 2 (Base64): {b64} -> {lon}')
print()

before = '00110100'
after_dot = '0011100001010011'
tail = '1100'

# Method 1: BCD
def bcd(bits):
    return ''.join([str(int(bits[i:i+4],2)) for i in range(0,len(bits),4)])

lat_bcd = bcd(before) + '.' + bcd(after_dot)
print(f'Method 1 (BCD): {lat_bcd} N -> HIROSHIMA')

# Method 2: Raw binary integer + binary fraction
lat_raw = int(before, 2)
frac = sum(int(b)*2**(-(i+1)) for i,b in enumerate(after_dot))
print(f'Method 2 (Raw Binary): {lat_raw + frac:.6f} N -> Amur Oblast, Russia')

# Method 3: ASCII
c1 = chr(int(before, 2))
c2 = chr(int(after_dot[:8], 2))
c3 = chr(int(after_dot[8:], 2))
print(f'Method 3 (ASCII): "{c1}{c2}{c3}" = 48S')

# Method 4: DMS
mins = int(after_dot[:8], 2)
secs_bcd = bcd(after_dot[8:])
dms_lat = lat_raw + mins/60 + int(secs_bcd)/3600
print(f'Method 4 (DMS): {lat_raw}d {mins}m {secs_bcd}s = {dms_lat:.4f} N')

print()
print('Hiroshima Wikipedia: 34.3853 N, 132.4553 E')
print(f'Our BCD decode:     {lat_bcd} N, {lon}')
print()
print('='*60)
print('TRY THESE ANSWERS (in priority order):')
print('='*60)

answers = [
    ('HIROSHIMA', 'BCD decode -> exact Hiroshima coords'),
    ('hiroshima', 'lowercase'),
    ('Hiroshima', 'title case'),
    ('JAPAN', 'country'),
    ('japan', 'lowercase'),
    ('LITTLE BOY', 'bomb dropped on Hiroshima'),
    ('ENOLA GAY', 'plane that dropped the bomb'),
    ('ATOMIC BOMB DOME', 'landmark at coordinates'),
    ('GENBAKU DOME', 'Japanese name of landmark'),
    ('PEACE MEMORIAL', 'Hiroshima Peace Memorial'),
    ('NUCLEAR', 'theme'),
    ('NUKE', 'short form'),
    ('MANHATTAN PROJECT', 'project name'),
    ('KHABAROVSK', 'if raw binary 52N'),
    ('RUSSIA', 'country if raw binary'),
    ('AMUR OBLAST', 'region if raw binary'),
    ('BIROBIDZHAN', 'if ASCII 48N'),
    ('34.3853, 132.4553', 'coordinates directly'),
    ('34.3853 N 132.4553 E', 'coordinates with direction'),
    ('COORDINATES', 'meta answer'),
    ('TARGET', 'enemy comms theme'),
    ('BOMBING', 'action'),
    ('OPERATION CENTERBOARD', 'military operation name'),
]

for i, (ans, reason) in enumerate(answers, 1):
    print(f'{i:2d}. {ans:30s} <- {reason}')
