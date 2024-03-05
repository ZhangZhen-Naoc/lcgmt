import numpy as np
from astropy.io import fits
import os
import xspec
import matplotlib.pyplot as plt
import myheasoft

nmos = 48
mosidarr = range(1, nmos + 1)

def exlc_xselect(evtfile, regfile, lcname, emin=0.3, emax=10.):
    if os.path.isfile(lcname):
        os.system('rm ' + lcname)
    phamin = int(np.floor(emin * 100.))
    phamax = int(np.floor(emax * 100.))

    xselstr=['','','read event','./',evtfile,'', 'filter region ' + regfile, 'filter grade 0-12', 'filter pha_cutoff ' + str(phamin) + ' ' + str(phamax),
        'set binsize 0.5', 'extract curve', 'save curve ' + lcname, 'exit','no']
    with open('xsel.script', 'w') as ofile:
        for line in xselstr:
            ofile.write(line + '\n')

    os.system('echo "@xsel.script" |xselect')

class wxt_detection:
    def __init__(self, input):
        self.obsid, self.mosid, self.srcid, self.tstart, self.tstop, self.ra, self.dec, self.poserr, \
            self.sig, self.net_rate, self.net_counts, \
            self.class_star, self.elon, self.expo = input
    def __print__(self):
        strnow = "obsid = {0}, mosid = {1}, srcid = {2}, RA = {3:.2f}, DEC = {4:.2f}, sig = {5:.2f}, net_rate = {6:.2f}, net_counts = {7:.2f}" \
            .format(self.obsid, self.mosid, self.srcid, self.ra, self.dec, self.sig, self.net_rate, self.net_counts)
        strnow = strnow + ", class_str = {0:.2f}, elongation = {1:.2f}, exposure = {2:.0f}".\
            format(self.class_star, self.elon, self.expo)
        print(strnow)

def writefits_wxtdetarr(wxtdetarr, outfile):
    ndet = len(wxtdetarr)
    mosidarr = np.zeros(ndet, dtype=np.int32)
    srcidarr = np.zeros(ndet, dtype=np.int32)
    tstartarr = np.zeros(ndet)
    tstoparr = np.zeros(ndet)
    raarr = np.zeros(ndet)
    decarr = np.zeros(ndet)
    poserrarr = np.zeros(ndet)
    sigarr = np.zeros(ndet)
    netratearr = np.zeros(ndet)
    netcountsarr = np.zeros(ndet)
    classarr = np.zeros(ndet)
    elonarr = np.zeros(ndet)
    expoarr = np.zeros(ndet)

    for i in range(ndet):
        if i == 0: 
            obsidarr = np.array([wxtdetarr[i].obsid])
        else:
            obsidarr = np.append(obsidarr, wxtdetarr[i].obsid)
        mosidarr[i] = wxtdetarr[i].mosid
        srcidarr[i] = wxtdetarr[i].srcid
        tstartarr[i] = wxtdetarr[i].tstart
        tstoparr[i] = wxtdetarr[i].tstop
        raarr[i] = wxtdetarr[i].ra
        decarr[i] = wxtdetarr[i].dec
        poserrarr[i] = wxtdetarr[i].poserr
        sigarr[i] = wxtdetarr[i].sig
        netratearr[i] = wxtdetarr[i].net_rate
        netcountsarr[i] = wxtdetarr[i].net_counts
        classarr[i] = wxtdetarr[i].class_star
        elonarr[i] = wxtdetarr[i].elon
        expoarr[i] = wxtdetarr[i].expo
    print(obsidarr)

    c1 = fits.Column(name='obs_id', array=obsidarr, format='20A')
    c2 = fits.Column(name='mos_id', array=mosidarr, format='J')
    c3 = fits.Column(name='src_id', array=srcidarr, format='J')
    c4 = fits.Column(name='tstart', array=tstartarr, format='E')
    c5 = fits.Column(name='tstop', array=tstoparr, format='E')
    c6 = fits.Column(name='ra', array=raarr, format='E')
    c7 = fits.Column(name='dec', array=decarr, format='E')
    c8 = fits.Column(name='poserr', array=poserrarr, format='E')
    c9 = fits.Column(name='significance', array=sigarr, format='E')
    c10 = fits.Column(name='net_rate', array=netratearr, format='E')
    c11 = fits.Column(name='net_counts', array=netcountsarr, format='E')
    c12 = fits.Column(name='class_star', array=classarr, format='E')
    c13 = fits.Column(name='elongation', array=elonarr, format='E')
    c14 = fits.Column(name='exposure', array=expoarr, format='E')

    t = fits.BinTableHDU.from_columns([c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14])
    t.writeto(outfile, overwrite=True)

def stat_dets(obsid, wxtdetarr, logfilename):
    logfile = open(logfilename, "a")

    for i in range(nmos):
        detfilenow = "./" + obsid + "/ep" + obsid + "wxt" + str(mosidarr[i]) + ".cat"
        if os.path.isfile(detfilenow):
            with fits.open(detfilenow) as hdulist:
                data = hdulist[1].data
                header = hdulist[1].header
                ndet = header["NAXIS2"]
                tstart = header["tstart"]
                tstop = header["tstop"]
                obsid = header['obs_id']

                for j in range(ndet):
                    wdetnow = wxt_detection((obsid, mosidarr[i], data['number'][j], tstart, tstop, data["ra"][j],
                        data["dec"][j], data["pos_err"][j], data["src_significance"][j], data["net_rate"][j],
                        data["net_counts"][j], data["class_star"][j], data["elongation"][j], data["exptime"][j]))
                    wxtdetarr = np.append(wxtdetarr, wdetnow)

        else:
            logfile.write(detfilenow + " does not exist!\n")

    logfile.close()
    return wxtdetarr

def exlc_single(evtfile, srcprefix, ra, dec):
    srcregfile = srcprefix + "src.reg"

    with open(srcregfile, "w") as srcregofile:
        srcregofile.write("fk5\n")
        regstr = "circle({0:.2f},{1:.2f},5.50039')".format(ra, dec)
        srcregofile.write(regstr)

    exlc_xselect(evtfile, srcregfile, srcprefix + "src_05to1.lc", emin=0.5, emax=1.)
    exlc_xselect(evtfile, srcregfile, srcprefix + "src_1to2.lc", emin=1., emax=2.)
    exlc_xselect(evtfile, srcregfile, srcprefix + "src_2to4.lc", emin=2., emax=4.)

def process_lc_spec(infile, logfile):
    ofile = open(logfile, "w")
    with fits.open(infile) as hdulist:
        data = hdulist[1].data
        header = hdulist[1].header
    obslist = data['obs_id']
    mosid = data['mos_id']
    srcid = data['src_id']
    ra = data['ra']
    dec = data['dec']
    ndet = header['naxis2']
    net_counts = data['net_counts']
    
    for i in range(ndet):
        os.chdir(obslist[i])

        prefix = "ep" + obslist[i] + "wxt" + str(mosid[i])
        srcprefix = prefix + "s" + str(srcid[i])
        srcphafile = srcprefix + ".pha"
        evtfile = prefix + "po_cl.evt"

        exlc_single(evtfile, srcprefix, ra[i], dec[i])

        if net_counts[i] >= 50.:
            grpfile = srcprefix + "_grp1.pha"
            os.system("grppha infile=" + srcphafile + " outfile=" + grpfile + 
                " comm='group min 1 & exit' clobber=yes")

            try:
                fitspec_single(srcprefix)
            except Exception as err:
                ofile.write(srcprefix + ": " + err.args[0] + "\n")
                calflux_single(srcprefix, ra[i], dec[i])
        else:
            calflux_single(srcprefix, ra[i], dec[i])

        os.chdir("..")
    ofile.close()

def calflux_single(srcprefix, ranow, decnow):
    fit = True
    grpfile = srcprefix + ".pha"

    s1 = xspec.Spectrum(grpfile)
    xspec.AllData.ignore("bad")
    xspec.AllData.ignore("0-0.5 4.0-**")
    xspec.Fit.statMethod = "cstat"
    xspec.Fit.query = "yes"
    m1 = xspec.Model("phabs * po")

    nhnow = myheasoft.cal_nh(ranow, decnow) / 1e22

    par1 = m1.phabs.nH
    par2 = m1.powerlaw.PhoIndex
    par3 = m1.powerlaw.norm
    par1.values = nhnow
    par2.values = 2.
    par3.values = 1.

    xspec.AllModels.calcFlux("0.5 4.0 err 90 90")
    src_net_rate = s1.rate[0]
    model_rate = s1.rate[3]
    model_flux = s1.flux[0]
    src_flux = model_flux / model_rate * src_net_rate

    xspec.AllData -= s1
    xspec.AllModels.clear()
    fit = False

    pores = np.array([0., 0., src_flux, 0., 0., nhnow, 0., 0., 2., 0., 0., src_net_rate / model_rate, 0., 0.])
    bbres = np.zeros(14)
    meres = np.zeros(14)
    best_model = "po"
    lo = 0.
    hi = 0.
    np.save(srcprefix + "_fit", (fit, best_model, src_flux, lo, hi, pores, bbres, meres))

def fitspec_single(srcprefix):
    fit = True
    grpfile = srcprefix + "_grp1.pha"

    fluxes = np.zeros(3)
    fluxlo = np.zeros(3)
    fluxhi = np.zeros(3)
    reduce_cstat_arr = np.zeros(3)
    models = ['pl', 'bb', 'mekal']

    s1 = xspec.Spectrum(grpfile)
    rate0 = s1.rate[0]
    xspec.AllData.ignore("bad")
    xspec.AllData.ignore("0-0.5 4.0-**")
    xspec.Fit.statMethod = "cstat"
    xspec.Fit.query = "yes"

    m1 = xspec.Model("phabs * po", setPars={0.1, 2., 1.})
    par1 = m1.phabs.nH
    par2 = m1.powerlaw.PhoIndex
    par3 = m1.powerlaw.norm
    par1.values = [0.1, 1e-4, 1e-3, 1e-3, 100, 100]
    par2.values = [2., 0.01, 0, 0, 4, 4]
    par3.values = rate0 / np.log(8.)
    m1.show()
    #par1.values = 0.1
    #par2.values = 2.

    xspec.Fit.perform()
    reduce_cstat_arr[0] = xspec.Fit.statistic / xspec.Fit.dof
    xspec.AllModels.calcFlux("0.5 4.0 err 90 90")
    fluxes[0] = s1.flux[0]
    fluxlo[0] = s1.flux[1]
    fluxhi[0] = s1.flux[2]

    if xspec.Fit.statistic / xspec.Fit.dof <= 3.:
        xspec.Fit.error("2.706 1-3")
        pores = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            par1.error[0], par1.error[1], par2.values[0], par2.error[0], par2.error[1], par3.values[0],
            par3.error[0], par3.error[1]])
    else:
        pores = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            0., 0., par2.values[0], 0., 0.,  par3.values[0], 0., 0.])

    xspec.Plot.setRebin(minSig=5., maxBins=100)
    xspec.Plot.xAxis="keV"
    xspec.Plot("data, model")
    enplot = xspec.Plot.x()
    enploterr = xspec.Plot.xErr()
    dataplot = xspec.Plot.y()
    errorplot = xspec.Plot.yErr()
    modelplot = xspec.Plot.model()

    fig, ax = plt.subplots()
    ax.errorbar(enplot, dataplot, xerr=enploterr, yerr=errorplot, color='k', ls='none', marker='+')
    ax.plot(enplot, modelplot)
    ax.set_xlabel("Energy [keV]")
    ax.set_yscale("log")
    ax.set_title(srcprefix + ", PL fit, cstat/dof={0:.2f}".format(reduce_cstat_arr[0]))
    ax.minorticks_on()
    plt.savefig(srcprefix + "_plfit.pdf", bbox_inches="tight")

    m2 = xspec.Model("phabs * bbody")
    bb_flux = 8.36e-8
    par1 = m2.phabs.nH
    par2 = m2.bbody.kT
    par3 = m2.bbody.norm
    par1.values = [0.1, 1e-4, 1e-3, 1e-3, 100, 100]
    par2.values = [0.5, 0.01, 0.01, 0.01, 4., 4.]
    par3.values = rate0 * 1.60218e-09 / bb_flux
    
    xspec.Fit.perform()

    reduce_cstat_arr[1] = xspec.Fit.statistic / xspec.Fit.dof

    xspec.AllModels.calcFlux("0.5 4.0 err 90 90")
    fluxes[1] = s1.flux[0]
    fluxlo[1] = s1.flux[1]
    fluxhi[1] = s1.flux[2]

    if xspec.Fit.statistic / xspec.Fit.dof <= 3.:
        xspec.Fit.error("2.706 1-3")
        bbres = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            par1.error[0], par1.error[1], par2.values[0], par2.error[0], par2.error[1], par3.values[0],
            par3.error[0], par3.error[1]])
    else:
        bbres = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            0., 0., par2.values[0], 0., 0.,  par3.values[0], 0., 0.])

    xspec.Plot("data, model")
    enplot = xspec.Plot.x()
    enploterr = xspec.Plot.xErr()
    dataplot = xspec.Plot.y()
    errorplot = xspec.Plot.yErr()
    modelplot = xspec.Plot.model()
    fig, ax = plt.subplots()
    ax.errorbar(enplot, dataplot, xerr=enploterr, yerr=errorplot, color='k', ls='none', marker='+')
    ax.plot(enplot, modelplot)
    ax.set_xlabel("Energy [keV]")
    ax.set_yscale("log")
    ax.set_title(srcprefix + ", BB fit, cstat/dof={0:.2f}".format(reduce_cstat_arr[0]))
    ax.minorticks_on()
    plt.savefig(srcprefix + "_bbfit.pdf", bbox_inches="tight")
    plt.close()

    ''' 
    m3 = xspec.Model("phabs * mekal")
    par1 = m3.phabs.nH
    par2 = m3.mekal.kT
    par3 = m3.mekal.norm
    par1.values = [0.1, 1e-4, 1e-3, 1e-3, 100, 100]
    par2.values = [0.5, 0.01, 0.01, 0.01, 4., 4.]
    par3.values = rate0 * 1.60218e-09 / bb_flux * 30.

    xspec.Fit.perform()
    reduce_cstat_arr[2] = xspec.Fit.statistic / xspec.Fit.dof
    xspec.AllModels.calcFlux("0.5 4.0 err 90 90")
    fluxes[2] = s1.flux[0]
    fluxlo[2] = s1.flux[1]
    fluxhi[2] = s1.flux[2]

    if xspec.Fit.statistic / xspec.Fit.dof <= 3.:
        xspec.Fit.error("2.706 1-3")
    #xspec.Fit.error("2.706 1-3")
        meres = [xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            par1.error[0], par1.error[1], par2.values[0], par2.error[0], par2.error[1], par3.values[0],
            par3.error[0], par3.error[1]]
    else:
        meres = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
            0., 0., par2.values[0], 0., 0.,  par3.values[0], 0., 0.])

    xspec.Plot("data, model")
    enplot = xspec.Plot.x()
    enploterr = xspec.Plot.xErr()
    dataplot = xspec.Plot.y()
    errorplot = xspec.Plot.yErr()
    modelplot = xspec.Plot.model()
    fig, ax = plt.subplots()
    ax.errorbar(enplot, dataplot, xerr=enploterr, yerr=errorplot, color='k', ls='none', marker='+')
    ax.plot(enplot, modelplot)
    ax.set_xlabel("Energy [keV]")
    ax.set_yscale("log")
    ax.set_title(srcprefix + ", MEKAL fit, cstat/dof={0:.2f}".format(reduce_cstat_arr[0]))
    ax.minorticks_on()
    plt.savefig(srcprefix + "_mekalfit.pdf", bbox_inches="tight")
    '''
    meres = np.zeros(16)
    reduce_cstat_arr[2] = np.amax(reduce_cstat_arr) + 1.

    bestcnu = np.amin(reduce_cstat_arr)
    index = ((np.where(reduce_cstat_arr == bestcnu))[0])[0]
    bestflux = fluxes[index]
    bestfluxlo = fluxlo[index]
    bestfluxhi = fluxhi[index]
    bestmo = models[index]

    np.save(srcprefix + "_fit", (fit, bestmo, bestflux, bestfluxlo, bestfluxhi, pores, bbres, meres))
    xspec.AllData -= s1

def writefits1(infile, outfile):
    #c1 = fits.Column(name='obs_id', array=obsidarr, format='20A')
    #c2 = fits.Column(name='mos_id', array=mosidarr, format='J')
    #c3 = fits.Column(name='src_id', array=srcidarr, format='J')
    #c4 = fits.Column(name='tstart', array=tstartarr, format='E')
    #c5 = fits.Column(name='tstop', array=tstoparr, format='E')
    #c6 = fits.Column(name='ra', array=raarr, format='E')
    #c7 = fits.Column(name='dec', array=decarr, format='E')
    #c8 = fits.Column(name='poserr', array=poserrarr, format='E')
    #c9 = fits.Column(name='significance', array=sigarr, format='E')
    #c10 = fits.Column(name='net_rate', array=netratearr, format='E')
    #c11 = fits.Column(name='net_caunts', array=netcountsarr, format='E')
    #c12 = fits.Column(name='class_star', array=classarr, format='E')
    #c13 = fits.Column(name='elongation', array=elonarr, format='E')
    #c14 = fits.Column(name='exposure', array=expoarr, format='E')
    dtypenow = np.dtype([('obs_id', 'U20'), ('cmos_id', np.int32), ('src_id', np.int32), ('tstart', np.float64),
        ('tstop', np.float64), ('ra', np.float64), ('dec', np.float64), ('pos_err', np.float64), 
        ('significance', np.float64), ('net_rate', np.float64), ('net_counts', np.float64), ('class_star', np.float64),
        ('elongation', np.float64), ('exposure', np.float64), ('srate', np.float64), ('srate_err', np.float64), ('mrate', np.float64), 
        ('mrate_err', np.float64), ('hrate', np.float64), ('hrate_err', np.float64), ('hr1', np.float64), ('hr1_err', np.float64),
        ('hr2', np.float64), ('hr2_erm', np.float64), ('fit', np.bool_), ('best_model', 'U20'), ('best_flux', np.float64),
        ('best_flux_lo', np.float64), ('best_flux_hi', np.float64),
        ('po_cstat', np.float64), ('po_dof', np.float64), ('po_flux', np.float64), ('po_flux_lo', np.float64),
        ('po_flux_hi', np.float64), ('po_nh', np.float64), ('po_nh_lo', np.float64), ('po_nh_hi', np.float64), 
        ('po_gamma', np.float64), ('po_gamma_lo', np.float64), ('po_gamma_hi', np.float64), ('po_norm', np.float64),
        ('po_norm_lo', np.float64), ('po_norm_hi', np.float64),
        ('bb_cstat', np.float64), ('bb_dof', np.float64), ('bb_flux', np.float64), ('bb_flux_lo', np.float64),
        ('bb_flux_hi', np.float64), ('bb_nh', np.float64), ('bb_nh_lo', np.float64), ('bb_nh_hi', np.float64), 
        ('bb_kt', np.float64), ('bb_kt_lo', np.float64), ('bb_kt_hi', np.float64), ('bb_norm', np.float64),
        ('bb_norm_lo', np.float64), ('bb_norm_hi', np.float64),
        ('mekal_cstat', np.float64), ('mekal_dof', np.float64), ('mekal_flux', np.float64), ('mekal_flux_lo', np.float64),
        ('mekal_flux_hi', np.float64), ('mekal_nh', np.float64), ('mekal_nh_lo', np.float64), ('mekal_nh_hi', np.float64), 
        ('mekal_kt', np.float64), ('mekal_kt_lo', np.float64), ('mekal_kt_hi', np.float64), ('mekal_norm', np.float64),
        ('mekal_norm_lo', np.float64), ('mekal_norm_hi', np.float64)])

    with fits.open(infile) as hdulist:
        data = hdulist[1].data
        header = hdulist[1].header
        ndet = header['naxis2']
    obslist = data['obs_id']
    mosid = data['mos_id']
    srcid = data['src_id']

    arr = np.zeros(ndet, dtype=dtypenow)

    for i in range(ndet):
        os.chdir(obslist[i])
        arr[i]['obs_id'] = data['obs_id'][i]
        arr[i]['cmos_id'] = data['mos_id'][i]
        arr[i]['src_id'] = data['src_id'][i]
        arr[i]['tstart'] = data['tstart'][i]
        arr[i]['tstop'] = data['tstop'][i]
        arr[i]['ra'] = data['ra'][i]
        arr[i]['dec'] = data['dec'][i]
        arr[i]['pos_err'] = data['poserr'][i]
        arr[i]['significance'] = data['significance'][i]
        arr[i]['net_rate'] = data['net_rate'][i]
        arr[i]['net_counts'] = data['net_counts'][i]
        arr[i]['class_star'] = data['class_star'][i]
        arr[i]['elongation'] = data['elongation'][i]
        arr[i]['exposure'] = data['exposure'][i]

        prefix = "ep" + obslist[i] + "wxt" + str(mosid[i])
        evtfile = prefix + "po_cl.evt"
        srcprefix = prefix + "s" + str(srcid[i])
        phafile = srcprefix + ".pha"

        srate, srate_err = myheasoft.calrate_xspec(phafile, 0.5, 1.)
        arr[i]['srate'] = srate
        arr[i]['srate_err'] = srate_err
        mrate, mrate_err = myheasoft.calrate_xspec(phafile, 1., 2.)
        arr[i]['mrate'] = mrate
        arr[i]['mrate_err'] = mrate_err
        hrate, hrate_err = myheasoft.calrate_xspec(phafile, 2., 4.)
        arr[i]['hrate'] = hrate
        arr[i]['hrate_err'] = hrate_err

        fit, bestmo, bestflux, bestfluxlo, bestfluxhi, pores, bbres, meres = np.load(srcprefix + "_fit.npy", allow_pickle=True)
        arr[i]['fit'] = fit
        arr[i]['best_model'] = bestmo
        arr[i]['best_flux'] = bestflux
        arr[i]['best_flux_lo'] = bestfluxlo
        arr[i]['best_flux_hi'] = bestfluxhi
        arr[i]['po_cstat'] = pores[0]
        arr[i]['po_dof'] = pores[1]
        arr[i]['po_flux'] = pores[2]
        arr[i]['po_flux_lo'] = pores[3]
        arr[i]['po_flux_hi'] = pores[4]
        arr[i]['po_nh'] = pores[5]
        arr[i]['po_nh_lo'] = pores[6]
        arr[i]['po_nh_hi'] = pores[7]
        arr[i]['po_gamma'] = pores[8]
        arr[i]['po_gamma_lo'] = pores[9]
        arr[i]['po_gamma_hi'] = pores[10]
        arr[i]['po_norm'] = pores[11]
        arr[i]['po_norm_lo'] = pores[12]
        arr[i]['po_norm_hi'] = pores[13]

        arr[i]['bb_cstat'] = bbres[0]
        arr[i]['bb_dof'] = bbres[1]
        arr[i]['bb_flux'] = bbres[2]
        arr[i]['bb_flux_lo'] = bbres[3]
        arr[i]['bb_flux_hi'] = bbres[4]
        arr[i]['bb_nh'] = bbres[5]
        arr[i]['bb_nh_lo'] = bbres[6]
        arr[i]['bb_nh_hi'] = bbres[7]
        arr[i]['bb_kt'] = bbres[8]
        arr[i]['bb_kt_lo'] = bbres[9]
        arr[i]['bb_kt_hi'] = bbres[10]
        arr[i]['bb_norm'] = bbres[11]
        arr[i]['bb_norm_lo'] = bbres[12]
        arr[i]['bb_norm_hi'] = bbres[13]

        arr[i]['mekal_cstat'] = meres[0]
        arr[i]['mekal_dof'] = meres[1]
        arr[i]['mekal_flux'] = meres[2]
        arr[i]['mekal_flux_lo'] = meres[3]
        arr[i]['mekal_flux_hi'] = meres[4]
        arr[i]['mekal_nh'] = meres[5]
        arr[i]['mekal_nh_lo'] = meres[6]
        arr[i]['mekal_nh_hi'] = meres[7]
        arr[i]['mekal_kt'] = meres[8]
        arr[i]['mekal_kt_lo'] = meres[9]
        arr[i]['mekal_kt_hi'] = meres[10]
        arr[i]['mekal_norm'] = meres[11]
        arr[i]['mekal_norm_lo'] = meres[12]
        arr[i]['mekal_norm_hi'] = meres[13]
        os.chdir("..")

    #pores = np.array([xspec.Fit.statistic, xspec.Fit.dof, s1.flux[0], s1.flux[1], s1.flux[2], par1.values[0], 
    #    par1.error[0], par1.error[1], par2.values[0], par2.error[0], par2.error[1], par3.values[0],
    #    par3.error[0], par3.error[1]])
        
    # count rates

    t = fits.BinTableHDU.from_columns(arr)
    t.writeto(outfile, overwrite=True)

def plot_cr_sig(infile):
    with fits.open(infile) as hdulist:
        data = hdulist[1].data

    fig, ax = plt.subplots()
    ax.scatter(data['net_rate'], data['significance'])
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Count rate [cts/s]")
    ax.set_ylabel("Significance " + r"[$\sigma$]")
    plt.savefig("cr_sig.pdf", bbox_inches="tight")
    plt.close()

def plot_cr_dist(infile):
    with fits.open(infile) as hdulist:
        data = hdulist[1].data

    fig, ax = plt.subplots()
    net_rate = data['net_rate']
    #logcr = np.log10(net_rate)
    #logcrmin = np.amin(logcr) - 0.01
    #logcrmax = np.amax(logcr) + 0.01

    ax.hist(np.log10(net_rate), bins=20, log=True)

    #ax.scatter(data['net_rate'], data['significance'])
    #ax.set_xscale("log")
    #ax.set_yscale("log")
    ax.set_xlabel("Log(Count rate [cts/s])")
    ax.set_ylabel("Numbers")
    ax.minorticks_on()
    plt.savefig("cr_dist.pdf", bbox_inches="tight")
    plt.close()

def plot_flux_dist(infile):
    with fits.open(infile) as hdulist:
        data = hdulist[1].data

    fig, ax = plt.subplots()
    best_flux = data['best_flux']
    #logcr = np.log10(net_rate)
    #logcrmin = np.amin(logcr) - 0.01
    #logcrmax = np.amax(logcr) + 0.01

    ax.hist(np.log10(best_flux), bins=20, log=True)

    #ax.scatter(data['net_rate'], data['significance'])
    #ax.set_xscale("log")
    #ax.set_yscale("log")
    ax.set_xlabel(r"$\rm Log(Flux\ [erg/s/cm^2])$")
    ax.set_ylabel("Numbers")
    ax.minorticks_on()
    plt.savefig("flux_dist.pdf", bbox_inches="tight")
    plt.close()

def plot_cts_sig(infile):
    with fits.open(infile) as hdulist:
        data = hdulist[1].data

    fig, ax = plt.subplots()
    ax.scatter(data['net_counts'], data['significance'])
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Counts")
    ax.set_ylabel("Significance " + r"[$\sigma$]")
    plt.savefig("cts_sig.pdf", bbox_inches="tight")
    plt.close()

def plot_flux_sig(infile):
    with fits.open(infile) as hdulist:
        data = hdulist[1].data

    fig, ax = plt.subplots()

    index = (np.where(data['fit'] == True))[0]
    index1 = (np.where(data['fit'] == False))[0]
    xerr_lo = data['best_flux'] - data['best_flux_lo']
    xerr_hi = data['best_flux_hi'] - data['best_flux']
    ax.errorbar(data['best_flux'][index], data['significance'][index], xerr=[xerr_lo[index], xerr_hi[index]],
        ls='none', marker='.', color='k')
    ax.plot(data['best_flux'][index1], data['significance'][index1], ls='none', marker='.', color='b')
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel(r"$\rm Flux\ [erg/s/cm^{2}]$")
    ax.set_ylabel("Significance " + r"[$\sigma$]")
    plt.savefig("flux_sig.pdf", bbox_inches="tight")
    plt.close()

def mk_plots(infile):
    plot_cr_dist(infile)
    plot_flux_dist(infile)
    plot_cr_sig(infile)
    plot_flux_sig(infile)

if __name__ == "__main__":
    #obsid = "00095660053"
    ##for i in range(len(wxtdetarr1)):
    ##    wxtdetarr1[i].__print__()
    #exlc("test.fits")
    #fitspec("test.fits")
    #writefits1("test.fits")
    #plot_cr_dist("test1.fits")
    #plot_cts_sig("test1.fits")
    #plot_flux_sig("test1.fits")
    #plot_flux_dist("test1.fits")

    logfile = "stat_det.log"
    with open("obs.list") as infile:
        obslist = infile.read().splitlines()
    nobs = len(obslist)

    #wxtdetarr = np.zeros(0, dtype=wxt_detection)
    #for i in range(nobs):
    #    wxtdetarr1 = stat_dets(obslist[i], wxtdetarr, logfile)
    #    wxtdetarr = np.copy(wxtdetarr1)
    #writefits_wxtdetarr(wxtdetarr1, "basic_info.fits")
    process_lc_spec("basic_info.fits", "fitspec.log")
    #writefits1("basic_info.fits", "src_table.fits")
    #mk_plots("src_table.fits")
