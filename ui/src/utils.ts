import { createDockerDesktopClient } from "@docker/extension-api-client"

const ddClient = createDockerDesktopClient()

/**
 * openBrowser opens a URL in the host system's browser
 */
export async function openBrowser(url: string) {
  return ddClient.host.openExternal(url)
}

export function navigateToContainer(containerId: string) {
  ddClient.desktopUI.navigate.viewContainer(containerId)
}

export function navigateToContainerLogs(containerId: string) {
  ddClient.desktopUI.navigate.viewContainerLogs(containerId)
}

/**
 * isWindows detects if the current host system is Windows. We rely on the
 * assumption that the Electron instance will give us the right `userAgent`
 * string.
 */
export function isWindows() {
  return navigator.userAgent.match(/Windows/i)
}

/**
 * isMacOS detects if the current host system is MacOS. We rely on the
 * assumption that the Electron instance will give us the right `userAgent`
 * string.
 */
export function isMacOS() {
  return navigator.userAgent.match(/Macintosh/i)
}

/**
 * debounce limits the number of times fn is called within a given time period.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 200,
) {
  let timeoutId = 0
  let callable = (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => fn(...args), wait)
  }
  return callable
}

// HACK: temporarily using this until we update the `tailscale status --json`
// to give us a domain by itself. This list is duplicated from a control export
// and these lines https://github.com/tailscale/corp/blob/main/control/cfgdb/cfgdb.go#L812-L1025
const SHARED_DOMAINS = `
gmail.com
123mail.org
150mail.com
150ml.com
16mail.com
2-mail.com
4email.net
50mail.com
airpost.net
allmail.net
bestmail.us
cluemail.com
elitemail.org
emailcorner.net
emailengine.net
emailengine.org
emailgroups.net
emailplus.org
emailuser.net
eml.cc
f-m.fm
fast-email.com
fast-mail.org
fastem.com
fastemail.us
fastemailer.com
fastest.cc
fastimap.com
fastmail.cn
fastmail.co.uk
fastmail.com
fastmail.com.au
fastmail.de
fastmail.es
fastmail.fm
fastmail.fr
fastmail.im
fastmail.in
fastmail.jp
fastmail.mx
fastmail.net
fastmail.nl
fastmail.org
fastmail.se
fastmail.to
fastmail.tw
fastmail.uk
fastmail.us
fastmailbox.net
fastmessaging.com
fea.st
fmail.co.uk
fmailbox.com
fmgirl.com
fmguy.com
ftml.net
h-mail.us
hailmail.net
imap-mail.com
imap.cc
imapmail.org
inoutbox.com
internet-e-mail.com
internet-mail.org
internetemails.net
internetmailing.net
jetemail.net
justemail.net
letterboxes.org
mail-central.com
mail-page.com
mailandftp.com
mailas.com
mailbolt.com
mailc.net
mailcan.com
mailforce.net
mailftp.com
mailhaven.com
mailingaddress.org
mailite.com
mailmight.com
mailnew.com
mailsent.net
mailservice.ms
mailup.net
mailworks.org
ml1.net
mm.st
myfastmail.com
mymacmail.com
nospammail.net
ownmail.net
petml.com
postinbox.com
postpro.net
proinbox.com
promessage.com
realemail.net
reallyfast.biz
reallyfast.info
rushpost.com
sent.as
sent.at
sent.com
speedpost.net
speedymail.org
ssl-mail.com
swift-mail.com
the-fastest.net
the-quickest.com
theinternetemail.com
veryfast.biz
veryspeedy.net
warpmail.net
xsmail.com
yepmail.net
your-mail.com
outlook.com.ar
outlook.com.au
outlook.at
outlook.be
outlook.com.br
outlook.cl
outlook.cz
outlook.dk
outlook.fr
outlook.de
outlook.com.gr
outlook.co.il
outlook.in
outlook.co.id
outlook.ie
outlook.it
outlook.hu
outlook.jp
outlook.kr
outlook.lv
outlook.my
outlook.co.nz
outlook.com.pe
outlook.ph
outlook.pt
outlook.sa
outlook.sg
outlook.sk
outlook.es
outlook.co.th
outlook.com.tr
outlook.com.vn
rocketmail.com
gmx.fr
tiki.ne.jp
dti.ne.jp
plala.or.jp
bbexcite.jp
gmx.hk
mail.ru
gmx.co.uk
yahoo.fr
gmx.ch
unl.edu
gmx.tm
live.jp
hotmail.it
earthlink.com
biglobe.ne.jp
hotmail.co.il
gmx.ie
live.fr
acm.org
tutamail.com
ybb.ne.jp
mailer.me
softbank.ne.jp
cox.net
miobox.jp
ieee.org
live.be
gmx.dk
gmx.se
live.no
gmx.net
gmx.ph
gmx.pt
live.com.mx
asu.edu
aleeas.com
wakwak.com
so-net.ne.jp
live.it
gmx.wf
enjoy.ne.jp
hotmail.es
gmx.co
dion.ne.jp
ocn.ne.jp
gmobb.jp
hotmail.com.mx
comcast.net
connect.hku.hk
hotmail.kg
live.dk
yahoo.co.jp
web.de
hotmail.be
live.ru
hotmail.ru
vodafone.ne.jp
tcn.ne.jp
iijmio-mail.jp
home.ne.jp
hotmail.co.jp
gmx.com
uqmobile.jp
wisc.edu
uwaterloo.ca
gmx.at
gmx.de
zaq.ne.jp
att.net
t-online.de
gmx.tw
nifty.com
live.fi
hotmail.co.nz
yahoo.gr
gmx.us
earthlink.net
gmx.ca
live.cn
auone-net.jp
tuta.io
gmx.it
gmx.eu
asahinet.jp
live.nl
live.ie
live.com.au
yahoo.co.uk
e23.jp
gol.com
libero.it
hotmail.ch
mineo.jp
yahoo.co.in
yeah.net
yahoo.ne.jp
gmx.ru
gmx.cc
hotmail.kz
dream.jp
live.se
gmx.cn
live.ca
live.at
hotmail.de
live.in
odn.ne.jp
msn.cn
hotmail.co.uk
mail.de
hi-ho.ne.jp
ymail.com
gmx.sg
miomio.jp
qq.com
kualnet.jp
yahoo.de
gmx.es
ymobile.ne.jp
hotmail.com.br
live.de
t-com.ne.jp
hotmail.jp
gmx.li
live.co.za
x-il.jp
seznam.cz
sonic.net
au.com
gmx.lu
hotmail.com.ar
docomo.ne.jp
ozzio.jp
posteo.net
sbcglobal.net
hotmail.no
github`.split("\n")

export function isSharedDomain(domain: string) {
  return SHARED_DOMAINS.includes(domain)
}
